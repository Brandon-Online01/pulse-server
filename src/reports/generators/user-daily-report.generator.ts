import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Not, Repository, LessThanOrEqual, IsNull } from 'typeorm';
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
import { startOfDay, endOfDay, format, differenceInMinutes, subDays } from 'date-fns';
import { AttendanceService } from '../../attendance/attendance.service';
import { ReportParamsDto } from '../dto/report-params.dto';
import { Quotation } from '../../shop/entities/quotation.entity';
import { TrackingService } from '../../tracking/tracking.service';
import { Claim } from '../../claims/entities/claim.entity';
import { UserRewards } from '../../rewards/entities/user-rewards.entity';
import { XPTransaction } from '../../rewards/entities/xp-transaction.entity';
import { UserTarget } from '../../user/entities/user-target.entity';

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
		@InjectRepository(Claim)
		private claimRepository: Repository<Claim>,
		@InjectRepository(UserRewards)
		private userRewardsRepository: Repository<UserRewards>,
		@InjectRepository(XPTransaction)
		private xpTransactionRepository: Repository<XPTransaction>,
		@InjectRepository(UserTarget)
		private userTargetRepository: Repository<UserTarget>,
		private attendanceService: AttendanceService,
		private trackingService: TrackingService,
	) {}

	private calculateGrowth(current: number, previous: number): string {
		if (previous === 0) {
			return current > 0 ? '+100%' : '0%';
		}
		if (current === 0 && previous === 0) {
			return '0%';
		}
		const growth = ((current - previous) / previous) * 100;
		const sign = growth >= 0 ? '+' : '';
		return `${sign}${Math.round(growth * 10) / 10}%`;
	}

	private parseGrowthPercentage(growthStr: string): number {
		if (!growthStr) return 0;
		return parseFloat(growthStr.replace(/[+%]/g, '')) || 0;
	}

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

		// Dates for previous period (for growth calculation)
		const previousStartDate = startOfDay(subDays(startDate, 1));
		const previousEndDate = endOfDay(subDays(startDate, 1));

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
				claimData,
				previousQuotationData,
				previousClientData,
				rewardsData,
				targetsData,
			] = await Promise.all([
				this.collectAttendanceData(userId, startDate, endDate),
				this.collectTaskMetrics(userId, startDate, endDate),
				this.collectLeadMetrics(userId, startDate, endDate),
				this.collectJournalData(userId, startDate, endDate),
				this.collectClientData(userId, startDate, endDate),
				this.collectLocationData(userId, startDate, endDate),
				this.collectQuotationData(userId, startDate, endDate),
				this.collectClaimData(userId, startDate, endDate),
				this.collectQuotationData(userId, previousStartDate, previousEndDate),
				this.collectClientData(userId, previousStartDate, previousEndDate),
				this.collectRewardsData(userId, startDate, endDate),
				this.collectTargetsData(userId),
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
					totalClaims: claimData.count,
					xpEarned: rewardsData.dailyXPEarned,
					currentLevel: rewardsData.currentLevel,
					currentRank: rewardsData.currentRank,
				},
				details: {
					attendance: attendanceData,
					tasks: taskMetrics,
					leads: leadMetrics,
					journal: journalEntries,
					clients: clientInteractions,
					location: locationData,
					quotations: quotationData,
					claims: claimData,
					rewards: rewardsData,
					targets: targetsData,
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
						quotationGrowth: this.calculateGrowth(
							quotationData.totalQuotations,
							previousQuotationData.totalQuotations,
						),
						revenueGrowth: this.calculateGrowth(
							quotationData.totalRevenue,
							previousQuotationData.totalRevenue,
						),
						customerGrowth: this.calculateGrowth(
							clientInteractions.newClients,
							previousClientData.newClients,
						),
						userSpecific: {
							todayLeads: leadMetrics.newLeadsCount,
							todayClaims: claimData.count,
							todayTasks: taskMetrics.completedCount,
							todayQuotations: quotationData.totalQuotations,
							hoursWorked: Math.round((attendanceData.totalWorkMinutes / 60) * 10) / 10,
							xpEarned: rewardsData.dailyXPEarned,
							currentLevel: rewardsData.currentLevel,
							currentRank: rewardsData.currentRank,
						},
						targets: targetsData,
					},
					tracking: locationData.trackingData,
				},
			};

			return response;
		} catch (error) {
			throw new Error(`Failed to generate daily report: ${error.message}`);
		}
	}

	private async collectAttendanceData(userId: number, startDate: Date, endDate: Date) {
		// Get daily stats from attendance service
		const dailyStats = await this.attendanceService.getDailyStats(userId, format(startDate, 'yyyy-MM-dd'));

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

	private async collectClaimData(userId: number, startDate: Date, endDate: Date) {
		try {
			const claims = await this.claimRepository.find({
				where: {
					// Assuming 'owner' or 'createdBy' relates to the user
					// and 'createdAt' or a specific 'claimDate' field exists
					owner: { uid: userId }, // Adjust field name as per your Claim entity
					createdAt: Between(startDate, endDate), // Or relevant date field for the claim
				},
				order: { createdAt: 'DESC' }, // Or relevant date field
			});

			const claimsList = claims.map((claim) => ({
				id: claim.uid,
				title: claim.uid || 'Untitled Claim', // Temporary: using uid as title placeholder
				description: this.truncateText('', 100), // Temporary: empty description placeholder
				status: claim.status,
				createdAt: format(new Date(claim.createdAt), 'HH:mm:ss'),
				// Add other relevant claim fields
			}));

			return {
				count: claims.length,
				claims: claimsList,
				hasClaims: claims.length > 0,
			};
		} catch (error) {
			this.logger.error(`Error collecting claim data for user ${userId}: ${error.message}`, error.stack);
			return {
				count: 0,
				claims: [],
				hasClaims: false,
			};
		}
	}

	private async collectLocationData(userId: number, startDate: Date, endDate: Date) {
		try {
			// Use TrackingService to get real tracking data
			// Assuming trackingService.getDailyTracking now returns a more detailed object
			// including locationAnalysis with timeSpent and averageTimePerLocation
			const trackingResult = await this.trackingService.getDailyTracking(userId, startDate);

			if (!trackingResult || !trackingResult.data) {
				return this.defaultLocationData();
			}

			const { trackingPoints, totalDistance, locationAnalysis } = trackingResult.data;

			if (!trackingPoints || !trackingPoints.length) {
				this.logger.warn(`No tracking points found for user ${userId} on ${format(startDate, 'yyyy-MM-dd')}`);
				return this.defaultLocationData(totalDistance);
			}

			const totalDistanceKm = parseFloat(totalDistance) || 0;

			// Format location data from tracking points
			const formattedTrackingPoints = trackingPoints.map((point) => ({
				type: 'tracking-point',
				timestamp: point.timestamp
					? format(new Date(point.timestamp), 'HH:mm:ss')
					: format(new Date(point.createdAt), 'HH:mm:ss'),
				latitude: point.latitude,
				longitude: point.longitude,
				address: point.address || `${point.latitude}, ${point.longitude}`,
				accuracy: point.accuracy,
				speed: point.speed,
			}));

			let emailTrackingLocations = [];
			let averageTimePerLocationFormatted = '~';

			if (locationAnalysis && locationAnalysis.locationsVisited) {
				emailTrackingLocations = locationAnalysis.locationsVisited.map((loc) => ({
					address: loc.address || `${loc.latitude}, ${loc.longitude}`,
					timeSpent: loc.timeSpentFormatted || this.formatDuration(loc.timeSpentMinutes || 0), // Assuming timeSpentMinutes is available
				}));
				averageTimePerLocationFormatted =
					locationAnalysis.averageTimePerLocationFormatted ||
					this.formatDuration(locationAnalysis.averageTimePerLocationMinutes || 0); // Assuming averageTimePerLocationMinutes
			} else {
				// Fallback if detailed locationAnalysis is not available
				emailTrackingLocations = formattedTrackingPoints
					.map((p) => ({ address: p.address, timeSpent: '~' }))
					.slice(0, 5); // Show some points if no analysis
			}

			const trackingDataForEmail = {
				totalDistance: `${totalDistanceKm.toFixed(1)} km`,
				locations: emailTrackingLocations,
				averageTimePerLocation: averageTimePerLocationFormatted,
			};

			return {
				locations: formattedTrackingPoints, // Raw points for detailed view
				totalDistance: totalDistanceKm.toFixed(1),
				totalLocations: formattedTrackingPoints.length,
				trackingData: trackingDataForEmail, // Analyzed/formatted data for email
			};
		} catch (error) {
			this.logger.error(`Error collecting location data for user ${userId}: ${error.message}`, error.stack);
			return this.defaultLocationData();
		}
	}

	private defaultLocationData(totalDistanceStr?: string) {
		const totalDistanceKm = parseFloat(totalDistanceStr || '0') || 0;
		return {
			locations: [],
			totalDistance: totalDistanceKm.toFixed(1),
			totalLocations: 0,
			trackingData: {
				totalDistance: `${totalDistanceKm.toFixed(1)} km`,
				locations: [],
				averageTimePerLocation: '~',
			},
		};
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

	private async collectRewardsData(userId: number, startDate: Date, endDate: Date) {
		try {
			// Get user rewards
			const userRewards = await this.userRewardsRepository.findOne({
				where: { owner: { uid: userId } },
				relations: ['owner'],
			});

			if (!userRewards) {
				return {
					dailyXPEarned: 0,
					currentLevel: 1,
					currentRank: 'ROOKIE',
					totalXP: 0,
					currentXP: 0,
					xpBreakdown: {
						tasks: 0,
						leads: 0,
						sales: 0,
						attendance: 0,
						collaboration: 0,
						other: 0,
					},
					dailyTransactions: [],
					leaderboardPosition: null,
				};
			}

			// Get XP transactions for today
			const dailyTransactions = await this.xpTransactionRepository.find({
				where: {
					userRewards: { uid: userRewards.uid },
					timestamp: Between(startDate, endDate),
				},
				order: { timestamp: 'DESC' },
			});

			// Calculate daily XP earned
			const dailyXPEarned = dailyTransactions.reduce((total, transaction) => {
				return total + transaction.xpAmount;
			}, 0);

			// Get leaderboard position
			const leaderboard = await this.userRewardsRepository.find({
				relations: ['owner'],
				order: { totalXP: 'DESC' },
				take: 100, // Get top 100 to find position
			});

			const leaderboardPosition = leaderboard.findIndex(entry => entry.uid === userRewards.uid) + 1;

			// Format daily transactions
			const formattedTransactions = dailyTransactions.map(transaction => ({
				action: transaction.action,
				xpAmount: transaction.xpAmount,
				timestamp: format(new Date(transaction.timestamp), 'HH:mm:ss'),
				sourceType: transaction.metadata?.sourceType || 'unknown',
				sourceId: transaction.metadata?.sourceId || null,
			}));

			return {
				dailyXPEarned,
				currentLevel: userRewards.level,
				currentRank: userRewards.rank,
				totalXP: userRewards.totalXP,
				currentXP: userRewards.currentXP,
				xpBreakdown: userRewards.xpBreakdown || {
					tasks: 0,
					leads: 0,
					sales: 0,
					attendance: 0,
					collaboration: 0,
					other: 0,
				},
				dailyTransactions: formattedTransactions,
				leaderboardPosition: leaderboardPosition > 0 ? leaderboardPosition : null,
			};
		} catch (error) {
			this.logger.error(`Error collecting rewards data for user ${userId}: ${error.message}`, error.stack);
			return {
				dailyXPEarned: 0,
				currentLevel: 1,
				currentRank: 'ROOKIE',
				totalXP: 0,
				currentXP: 0,
				xpBreakdown: {
					tasks: 0,
					leads: 0,
					sales: 0,
					attendance: 0,
					collaboration: 0,
					other: 0,
				},
				dailyTransactions: [],
				leaderboardPosition: null,
			};
		}
	}

	private async collectTargetsData(userId: number) {
		try {
			// Get user targets
			const userTarget = await this.userTargetRepository.findOne({
				where: { user: { uid: userId } },
				relations: ['user'],
			});

			if (!userTarget) {
				return {
					hasTargets: false,
					targetPeriod: null,
					periodStartDate: null,
					periodEndDate: null,
					salesTarget: null,
					hoursTarget: null,
					leadsTarget: null,
					clientsTarget: null,
					checkInsTarget: null,
					callsTarget: null,
					targetProgress: {},
				};
			}

			// Calculate progress percentages
			const calculateProgress = (current: number, target: number) => {
				if (!target || target <= 0) return 0;
				return Math.min(Math.round((current / target) * 100), 100);
			};

			const targetProgress = {
				sales: {
					current: userTarget.currentSalesAmount || 0,
					target: userTarget.targetSalesAmount || 0,
					progress: calculateProgress(userTarget.currentSalesAmount || 0, userTarget.targetSalesAmount || 0),
					currency: userTarget.targetCurrency || 'ZAR',
				},
				hours: {
					current: userTarget.currentHoursWorked || 0,
					target: userTarget.targetHoursWorked || 0,
					progress: calculateProgress(userTarget.currentHoursWorked || 0, userTarget.targetHoursWorked || 0),
				},
				leads: {
					current: userTarget.currentNewLeads || 0,
					target: userTarget.targetNewLeads || 0,
					progress: calculateProgress(userTarget.currentNewLeads || 0, userTarget.targetNewLeads || 0),
				},
				clients: {
					current: userTarget.currentNewClients || 0,
					target: userTarget.targetNewClients || 0,
					progress: calculateProgress(userTarget.currentNewClients || 0, userTarget.targetNewClients || 0),
				},
				checkIns: {
					current: userTarget.currentCheckIns || 0,
					target: userTarget.targetCheckIns || 0,
					progress: calculateProgress(userTarget.currentCheckIns || 0, userTarget.targetCheckIns || 0),
				},
				calls: {
					current: userTarget.currentCalls || 0,
					target: userTarget.targetCalls || 0,
					progress: calculateProgress(userTarget.currentCalls || 0, userTarget.targetCalls || 0),
				},
			};

			return {
				hasTargets: true,
				targetPeriod: userTarget.targetPeriod || 'Monthly',
				periodStartDate: userTarget.periodStartDate ? format(new Date(userTarget.periodStartDate), 'yyyy-MM-dd') : null,
				periodEndDate: userTarget.periodEndDate ? format(new Date(userTarget.periodEndDate), 'yyyy-MM-dd') : null,
				salesTarget: {
					current: userTarget.currentSalesAmount || 0,
					target: userTarget.targetSalesAmount || 0,
					currency: userTarget.targetCurrency || 'ZAR',
					formatted: new Intl.NumberFormat('en-ZA', {
						style: 'currency',
						currency: userTarget.targetCurrency || 'ZAR',
					}).format(userTarget.currentSalesAmount || 0),
					targetFormatted: new Intl.NumberFormat('en-ZA', {
						style: 'currency',
						currency: userTarget.targetCurrency || 'ZAR',
					}).format(userTarget.targetSalesAmount || 0),
				},
				hoursTarget: {
					current: userTarget.currentHoursWorked || 0,
					target: userTarget.targetHoursWorked || 0,
				},
				leadsTarget: {
					current: userTarget.currentNewLeads || 0,
					target: userTarget.targetNewLeads || 0,
				},
				clientsTarget: {
					current: userTarget.currentNewClients || 0,
					target: userTarget.targetNewClients || 0,
				},
				checkInsTarget: {
					current: userTarget.currentCheckIns || 0,
					target: userTarget.targetCheckIns || 0,
				},
				callsTarget: {
					current: userTarget.currentCalls || 0,
					target: userTarget.targetCalls || 0,
				},
				targetProgress,
			};
		} catch (error) {
			this.logger.error(`Error collecting targets data for user ${userId}: ${error.message}`, error.stack);
			return {
				hasTargets: false,
				targetPeriod: null,
				periodStartDate: null,
				periodEndDate: null,
				salesTarget: null,
				hoursTarget: null,
				leadsTarget: null,
				clientsTarget: null,
				checkInsTarget: null,
				callsTarget: null,
				targetProgress: {},
			};
		}
	}
}
