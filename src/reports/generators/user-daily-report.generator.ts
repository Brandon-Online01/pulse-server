import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Not, Repository, LessThanOrEqual, IsNull, Like } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Journal } from '../../journal/entities/journal.entity';
import { Client } from '../../clients/entities/client.entity';
import { CheckIn } from '../../check-ins/entities/check-in.entity';
import { TaskStatus, TaskPriority } from '../../lib/enums/task.enums';
import { LeadStatus } from '../../lib/enums/lead.enums';
import { AttendanceStatus } from '../../lib/enums/attendance.enums';
import { startOfDay, endOfDay, format, differenceInMinutes } from 'date-fns';
import { AttendanceService } from '../../attendance/attendance.service';
import { ReportParamsDto } from '../dto/report-params.dto';
import { Quotation } from '../../shop/entities/quotation.entity';

@Injectable()
export class UserDailyReportGenerator {
	private readonly logger = new Logger(UserDailyReportGenerator.name);

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(Lead)
		private leadRepository: Repository<Lead>,
		@InjectRepository(Journal)
		private journalRepository: Repository<Journal>,
		@InjectRepository(Client)
		private clientRepository: Repository<Client>,
		@InjectRepository(CheckIn)
		private checkInRepository: Repository<CheckIn>,
		@InjectRepository(Quotation)
		private quotationRepository: Repository<Quotation>,
		private attendanceService: AttendanceService,
	) {}

	async generate(params: ReportParamsDto): Promise<Record<string, any>> {
		const { userId, dateRange } = params.filters || {};

		if (!userId) {
			throw new Error('User ID is required for generating a daily user report');
		}

		let startDate = new Date();
		let endDate = new Date();

		if (dateRange && dateRange.start && dateRange.end) {
			startDate = new Date(dateRange.start);
			endDate = new Date(dateRange.end);
		} else {
			// Default to today
			startDate = startOfDay(new Date());
			endDate = endOfDay(new Date());
		}

		this.logger.log(`Generating daily report for user ${userId} from ${startDate} to ${endDate}`);

		try {
			// Get user data
			const user = await this.userRepository.findOne({
				where: { uid: userId },
			});

			if (!user) {
				throw new Error(`User with ID ${userId} not found`);
			}

			// Collect all data in parallel for efficiency
			const [
				attendanceData,
				taskMetrics,
				leadMetrics,
				journalEntries,
				clientInteractions,
				locationData,
				quotationData,
			] = await Promise.all([
				this.collectAttendanceData(userId, startDate, endDate),
				this.collectTaskMetrics(userId, startDate, endDate),
				this.collectLeadMetrics(userId, startDate, endDate),
				this.collectJournalData(userId, startDate, endDate),
				this.collectClientData(userId, startDate, endDate),
				this.collectLocationData(userId, startDate, endDate),
				this.collectQuotationData(userId, startDate, endDate),
			]);

			// Format the date for display
			const formattedDate = format(startDate, 'yyyy-MM-dd');

			// Build the report data structure

			const response = {
				metadata: {
					reportType: 'user_daily',
					userId,
					userName: `${user.name} ${user.surname || ''}`.trim(),
					date: formattedDate,
					generatedAt: new Date(),
				},
				summary: {
					hoursWorked: Math.round((attendanceData.totalWorkMinutes / 60) * 10) / 10,
					tasksCompleted: taskMetrics.completedCount,
					newLeads: leadMetrics.newLeadsCount,
					clientInteractions: clientInteractions.totalInteractions,
					totalEntries: journalEntries.count,
					totalQuotations: quotationData.totalQuotations,
					totalRevenue: quotationData.totalRevenueFormatted,
				},
				details: {
					attendance: attendanceData,
					tasks: taskMetrics,
					leads: leadMetrics,
					journal: journalEntries,
					clients: clientInteractions,
					location: locationData,
					quotations: quotationData,
				},
				// Format data specifically for email template
				emailData: {
					name: user.name,
					date: formattedDate,
					metrics: {
						attendance: {
							status: attendanceData.status,
							startTime: attendanceData.firstCheckIn,
							endTime: attendanceData.lastCheckOut,
							totalHours: attendanceData.totalWorkMinutes / 60,
							duration: this.formatDuration(attendanceData.totalWorkMinutes),
							checkInLocation: attendanceData.firstCheckInLocation,
							checkOutLocation: attendanceData.lastCheckOutLocation,
						},
						totalQuotations: quotationData.totalQuotations,
						totalRevenue: quotationData.totalRevenueFormatted,
						newCustomers: clientInteractions.newClients,
						quotationGrowth: '0%', // To be implemented
						revenueGrowth: '0%', // To be implemented
						customerGrowth: '0%', // To be implemented
						userSpecific: {
							todayLeads: leadMetrics.newLeadsCount,
							todayClaims: 0, // Placeholder, implement if needed
							todayTasks: taskMetrics.completedCount,
							todayQuotations: quotationData.totalQuotations,
							hoursWorked: Math.round((attendanceData.totalWorkMinutes / 60) * 10) / 10,
						},
					},
					tracking: locationData.trackingData,
				},
			};

			console.log(response);

			return response;
		} catch (error) {
			this.logger.error(`Error generating user daily report: ${error.message}`, error.stack);
			throw new Error(`Failed to generate daily report: ${error.message}`);
		}
	}

	private async collectAttendanceData(userId: number, startDate: Date, endDate: Date) {
		// Get daily stats from attendance service
		const dailyStats = await this.attendanceService.getDailyStats(userId);

		// Get all attendance records for the day
		const attendanceRecords = await this.attendanceRepository.find({
			where: {
				owner: { uid: userId },
				checkIn: MoreThanOrEqual(startDate),
				checkOut: LessThanOrEqual(endDate),
			},
			order: { checkIn: 'ASC' },
		});

		// Get the first check-in and last check-out
		const firstRecord = attendanceRecords[0];
		const lastRecord = attendanceRecords[attendanceRecords.length - 1];

		// Find active shift
		const activeShift = await this.attendanceRepository.findOne({
			where: {
				owner: { uid: userId },
				status: In([AttendanceStatus.PRESENT, AttendanceStatus.ON_BREAK]),
				checkIn: MoreThanOrEqual(startDate),
				checkOut: IsNull(),
			},
		});

		// Calculate total work minutes from milliseconds
		const totalWorkMinutes = Math.floor(dailyStats.dailyWorkTime / (1000 * 60));
		const totalBreakMinutes = Math.floor(dailyStats.dailyBreakTime / (1000 * 60));

		// Format locations for reporting
		let firstCheckInLocation = null;
		if (firstRecord?.checkInLatitude && firstRecord?.checkInLongitude) {
			firstCheckInLocation = {
				latitude: parseFloat(String(firstRecord.checkInLatitude)),
				longitude: parseFloat(String(firstRecord.checkInLongitude)),
				notes: firstRecord.checkInNotes || '',
			};
		}

		let lastCheckOutLocation = null;
		if (lastRecord?.checkOutLatitude && lastRecord?.checkOutLongitude) {
			lastCheckOutLocation = {
				latitude: parseFloat(String(lastRecord.checkOutLatitude)),
				longitude: parseFloat(String(lastRecord.checkOutLongitude)),
				notes: lastRecord.checkOutNotes || '',
			};
		}

		return {
			status: activeShift ? activeShift.status : lastRecord ? lastRecord.status : 'NOT_PRESENT',
			firstCheckIn: firstRecord?.checkIn ? format(new Date(firstRecord.checkIn), 'HH:mm:ss') : null,
			lastCheckOut: lastRecord?.checkOut ? format(new Date(lastRecord.checkOut), 'HH:mm:ss') : null,
			totalWorkMinutes,
			totalBreakMinutes,
			totalShifts: attendanceRecords.length,
			firstCheckInLocation,
			lastCheckOutLocation,
			onBreak: activeShift?.status === AttendanceStatus.ON_BREAK,
			breakDetails: this.formatBreakDetails(attendanceRecords),
			isCurrentlyWorking: !!activeShift,
		};
	}

	private formatBreakDetails(attendanceRecords: Attendance[]) {
		let breakDetails = [];

		attendanceRecords.forEach((record) => {
			if (record.breakDetails && record.breakDetails.length > 0) {
				const formattedBreaks = record.breakDetails
					.map((breakItem) => {
						if (!breakItem.startTime || !breakItem.endTime) return null;

						const startTime = new Date(breakItem.startTime);
						const endTime = breakItem.endTime ? new Date(breakItem.endTime) : null;

						return {
							startTime: format(startTime, 'HH:mm:ss'),
							endTime: endTime ? format(endTime, 'HH:mm:ss') : null,
							duration:
								breakItem.duration ||
								(endTime ? this.formatDuration(differenceInMinutes(endTime, startTime)) : null),
							notes: breakItem.notes || '',
						};
					})
					.filter(Boolean);

				breakDetails = [...breakDetails, ...formattedBreaks];
			}
		});

		return breakDetails;
	}

	private async collectTaskMetrics(userId: number, startDate: Date, endDate: Date) {
		// Tasks completed today
		const completedTasks = await this.taskRepository.find({
			where: {
				status: TaskStatus.COMPLETED,
				completionDate: Between(startDate, endDate),
				assignees: { uid: userId },
			},
		});

		// Tasks created today
		const createdTasks = await this.taskRepository.find({
			where: {
				creator: { uid: userId },
				createdAt: Between(startDate, endDate),
			},
		});

		// Tasks due tomorrow
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		const dayAfterTomorrow = new Date(tomorrow);
		dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

		const dueTomorrow = await this.taskRepository.find({
			where: {
				deadline: Between(tomorrow, dayAfterTomorrow),
				assignees: { uid: userId },
				status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
			},
		});

		// Overdue tasks
		const overdueTasks = await this.taskRepository.find({
			where: {
				status: TaskStatus.OVERDUE,
				assignees: { uid: userId },
			},
		});

		// Map tasks to simplified format
		const completedTasksList = completedTasks.map((task) => ({
			id: task.uid,
			title: task.title,
			description: this.truncateText(task.description, 100),
			priority: task.priority,
			completedAt: task.completionDate ? format(new Date(task.completionDate), 'HH:mm:ss') : null,
		}));

		const dueTomorrowList = dueTomorrow.map((task) => ({
			id: task.uid,
			title: task.title,
			description: this.truncateText(task.description, 100),
			priority: task.priority,
			deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd HH:mm') : null,
		}));

		const overdueList = overdueTasks.map((task) => ({
			id: task.uid,
			title: task.title,
			description: this.truncateText(task.description, 100),
			priority: task.priority,
			deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd HH:mm') : null,
			daysOverdue: task.deadline
				? Math.floor((new Date().getTime() - new Date(task.deadline).getTime()) / (1000 * 3600 * 24))
				: 0,
		}));

		// Calculate completion rate
		const totalAssignedTasks = completedTasks.length + overdueTasks.length;
		const completionRate = totalAssignedTasks > 0 ? (completedTasks.length / totalAssignedTasks) * 100 : 0;

		return {
			completedCount: completedTasks.length,
			createdCount: createdTasks.length,
			dueTomorrowCount: dueTomorrow.length,
			overdueCount: overdueTasks.length,
			completionRate: Math.round(completionRate * 10) / 10,
			completedTasks: completedTasksList,
			dueTomorrowTasks: dueTomorrowList,
			overdueTasks: overdueList,
			priorityBreakdown: this.calculatePriorityBreakdown([...completedTasks, ...dueTomorrow, ...overdueTasks]),
		};
	}

	private calculatePriorityBreakdown(tasks: Task[]) {
		const counts = {
			[TaskPriority.LOW]: 0,
			[TaskPriority.MEDIUM]: 0,
			[TaskPriority.HIGH]: 0,
			[TaskPriority.URGENT]: 0,
		};

		tasks.forEach((task) => {
			if (counts.hasOwnProperty(task.priority)) {
				counts[task.priority]++;
			}
		});

		return counts;
	}

	private async collectLeadMetrics(userId: number, startDate: Date, endDate: Date) {
		// New leads captured today
		const newLeads = await this.leadRepository.find({
			where: {
				ownerUid: userId,
				createdAt: Between(startDate, endDate),
			},
		});

		// Leads converted today
		const convertedLeads = await this.leadRepository.find({
			where: {
				ownerUid: userId,
				status: LeadStatus.CONVERTED,
				updatedAt: Between(startDate, endDate),
			},
		});

		// Format leads for report
		const newLeadsList = newLeads.map((lead) => ({
			id: lead.uid,
			name: lead.name || 'Unnamed Lead',
			email: lead.email || 'N/A',
			phone: lead.phone || 'N/A',
			createdAt: format(new Date(lead.createdAt), 'HH:mm:ss'),
			hasImage: !!lead.image,
			hasLocation: !!(lead.latitude && lead.longitude),
		}));

		const convertedLeadsList = convertedLeads.map((lead) => ({
			id: lead.uid,
			name: lead.name || 'Unnamed Lead',
			email: lead.email || 'N/A',
			phone: lead.phone || 'N/A',
			convertedAt: format(new Date(lead.updatedAt), 'HH:mm:ss'),
		}));

		// Calculate conversion rate
		const conversionRate = newLeads.length > 0 ? (convertedLeads.length / newLeads.length) * 100 : 0;

		return {
			newLeadsCount: newLeads.length,
			convertedCount: convertedLeads.length,
			conversionRate: Math.round(conversionRate * 10) / 10,
			newLeads: newLeadsList,
			convertedLeads: convertedLeadsList,
		};
	}

	private async collectJournalData(userId: number, startDate: Date, endDate: Date) {
		// Journal entries for today
		const entries = await this.journalRepository.find({
			where: {
				owner: { uid: userId },
				createdAt: Between(startDate, endDate),
			},
			order: { createdAt: 'DESC' },
		});

		// Format entries for report
		const journalList = entries.map((entry) => ({
			id: entry.uid,
			title: entry.clientRef || 'Untitled Entry', // Using clientRef instead of name
			content: this.truncateText(entry.comments || '', 150), // Using comments instead of description
			createdAt: format(new Date(entry.createdAt), 'HH:mm:ss'),
			hasAttachments: !!entry.fileURL,
			fileURL: entry.fileURL,
		}));

		return {
			count: entries.length,
			entries: journalList,
			hasEntries: entries.length > 0,
		};
	}

	private async collectClientData(userId: number, startDate: Date, endDate: Date) {
		// New clients added today
		const newClients = await this.clientRepository.find({
			where: {
				createdAt: Between(startDate, endDate),
			},
		});

		// Client check-ins today
		const clientCheckIns = await this.checkInRepository.find({
			where: {
				checkInTime: Between(startDate, endDate),
			},
			relations: ['client'],
		});

		// Group check-ins by client
		const clientInteractionMap = new Map();
		clientCheckIns.forEach((checkIn) => {
			if (checkIn.client) {
				const clientId = checkIn.client.uid;
				if (!clientInteractionMap.has(clientId)) {
					clientInteractionMap.set(clientId, {
						client: checkIn.client,
						interactions: [],
					});
				}
				clientInteractionMap.get(clientId).interactions.push({
					id: checkIn.uid,
					type: 'check-in',
					timestamp: format(new Date(checkIn.checkInTime), 'HH:mm:ss'),
					location: `${checkIn?.checkInLocation}` || 'Unknown location',
				});
			}
		});

		// Format client data
		const clientInteractions = Array.from(clientInteractionMap.values()).map((item) => ({
			clientId: item.client.uid,
			clientName: item.client.name,
			interactionCount: item.interactions.length,
			interactions: item.interactions,
		}));

		return {
			newClients: newClients.length,
			totalInteractions: clientCheckIns.length,
			clientsInteractedWith: clientInteractionMap.size,
			clientInteractions: clientInteractions,
		};
	}

	private async collectLocationData(userId: number, startDate: Date, endDate: Date) {
		// In a real implementation, this would connect to a location tracking service
		// For this example, we'll use check-ins as a proxy for location data
		const checkIns = await this.checkInRepository.find({
			where: {
				owner: { uid: userId },
				checkInTime: Between(startDate, endDate),
			},
			order: { checkInTime: 'ASC' },
		});

		// If there's no tracking service, format attendance locations
		const attendanceRecords = await this.attendanceRepository.find({
			where: {
				owner: { uid: userId },
				checkIn: MoreThanOrEqual(startDate),
				checkOut: LessThanOrEqual(endDate),
			},
			order: { checkIn: 'ASC' },
		});

		// Combine all location data
		const locations = [];
		let totalDistance = 0;

		// Add attendance locations
		attendanceRecords.forEach((record) => {
			if (record.checkInLatitude && record.checkInLongitude) {
				locations.push({
					type: 'check-in',
					timestamp: format(new Date(record.checkIn), 'HH:mm:ss'),
					latitude: parseFloat(String(record.checkInLatitude)),
					longitude: parseFloat(String(record.checkInLongitude)),
					address: `${record?.checkInLatitude} ${record?.checkInLongitude}` || 'Unknown location',
				});
			}

			if (record.checkOutLatitude && record.checkOutLongitude) {
				locations.push({
					type: 'check-out',
					timestamp: record.checkOut ? format(new Date(record.checkOut), 'HH:mm:ss') : null,
					latitude: parseFloat(String(record.checkOutLatitude)),
					longitude: parseFloat(String(record.checkOutLongitude)),
					address: `${record?.checkOutLatitude} ${record?.checkOutLongitude}` || 'Unknown location',
				});
			}
		});

		// Add check-in locations
		checkIns.forEach((checkIn) => {
			if (checkIn?.checkInLocation && checkIn.checkOutLocation) {
				locations.push({
					type: 'client-check-in',
					timestamp: format(new Date(checkIn.checkInTime), 'HH:mm:ss'),
					latitude: parseFloat(String(checkIn?.checkInLocation)),
					longitude: parseFloat(String(checkIn?.checkInLocation)),
					address: checkIn.checkInLocation || 'Unknown location',
					clientName: checkIn.client?.name || 'Unknown client',
				});
			}
		});

		// Estimate total distance (in a real implementation, this would use actual route data)
		// Simple estimation using sequential points
		for (let i = 1; i < locations.length; i++) {
			const prev = locations[i - 1];
			const curr = locations[i];
			totalDistance += this.calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
		}

		// Format for the tracking data structure used in email templates
		const trackingData = {
			totalDistance: `${totalDistance.toFixed(1)} km`,
			locations: locations.map((loc) => ({
				address: loc.address,
				timeSpent: '~', // Time spent would be calculated in a real implementation
			})),
			averageTimePerLocation: '~', // Would be calculated in a real implementation
		};

		return {
			locations,
			totalDistance: totalDistance.toFixed(1),
			totalLocations: locations.length,
			trackingData,
		};
	}

	// Helper function to calculate distance between two coordinates (Haversine formula)
	private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371; // Radius of the earth in km
		const dLat = this.deg2rad(lat2 - lat1);
		const dLon = this.deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in km
		return distance;
	}

	private deg2rad(deg: number): number {
		return deg * (Math.PI / 180);
	}

	private formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	}

	private truncateText(text: string, maxLength: number): string {
		if (!text) return '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	private async collectQuotationData(userId: number, startDate: Date, endDate: Date) {
		try {
			// Get quotations created by the user in the specified date range
			const quotations = await this.quotationRepository.find({
				where: {
					placedBy: { uid: userId },
					createdAt: Between(startDate, endDate),
				},
				relations: ['quotationItems', 'client'],
			});

			// Calculate total revenue
			let totalRevenue = 0;
			const quotationDetails = quotations.map((quotation) => {
				const amount =
					typeof quotation.totalAmount === 'string'
						? parseFloat(quotation.totalAmount)
						: quotation.totalAmount;

				totalRevenue += Number.isNaN(amount) ? 0 : amount;

				return {
					id: quotation.uid,
					quotationNumber: quotation.quotationNumber,
					clientName: quotation.client ? quotation.client.name : 'Unknown',
					totalAmount: amount,
					totalItems: quotation.totalItems,
					status: quotation.status,
					createdAt: format(new Date(quotation.createdAt), 'HH:mm:ss'),
				};
			});

			// Format the total revenue with currency symbol
			const totalRevenueFormatted = new Intl.NumberFormat('en-ZA', {
				style: 'currency',
				currency: 'ZAR',
			}).format(totalRevenue);

			return {
				totalQuotations: quotations.length,
				totalRevenue,
				totalRevenueFormatted,
				quotationDetails,
			};
		} catch (error) {
			this.logger.error(`Error collecting quotation data: ${error.message}`, error.stack);
			return {
				totalQuotations: 0,
				totalRevenue: 0,
				totalRevenueFormatted: 'R0.00',
				quotationDetails: [],
			};
		}
	}
}
