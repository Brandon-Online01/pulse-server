import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { startOfDay, endOfDay, format, subDays, isWeekend, subBusinessDays, isValid } from 'date-fns';

import { Attendance } from '../entities/attendance.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { OrganizationHoursService } from './organization-hours.service';
import { UserService } from '../../user/user.service';
import { AttendanceStatus } from '../../lib/enums/attendance.enums';
import { AccessLevel } from '../../lib/enums/user.enums';
import { EmailType } from '../../lib/enums/email.enums';
import { AccountStatus } from '../../lib/enums/status.enums';
import { TimeCalculatorUtil } from '../utils/time-calculator.util';

/**
 * AttendanceReportsService
 *
 * Automated attendance reporting system that sends daily attendance reports via email.
 *
 * Features:
 * - Morning reports: Sent 5 minutes after organization opening time
 * - Evening reports: Sent 30 minutes after organization closing time
 * - Smart scheduling: Respects each organization's working hours and holidays
 * - Comprehensive data: Includes attendance rates, punctuality breakdown, insights, and recommendations
 * - Recipients: Automatically sends to OWNER, ADMIN, and HR level users
 * - Duplicate prevention: Prevents sending multiple reports on the same day
 * - Email templates: Uses Handlebars templates for professional report formatting
 *
 * Cron schedules:
 * - Morning checks: Every minute (for accurate 5-minute timing)
 * - Evening checks: Every 30 minutes (sufficient for 30-minute delay)
 */

interface AttendanceReportUser {
	uid: number;
	name: string;
	surname: string;
	fullName: string;
	email: string;
	phone?: string;
	role: AccessLevel;
	userProfile?: {
		avatar?: string;
	};
	branch?: {
		uid: number;
		name: string;
	};
}

interface AttendanceSummary {
	totalEmployees: number;
	presentCount: number;
	absentCount: number;
	attendanceRate: number;
}

interface PunctualityBreakdown {
	earlyArrivals: AttendanceReportUser[];
	onTimeArrivals: AttendanceReportUser[];
	lateArrivals: AttendanceReportUser[];
	earlyPercentage: number;
	onTimePercentage: number;
	latePercentage: number;
}

interface EmployeeAttendanceMetric {
	user: AttendanceReportUser;
	todayCheckIn: string | null;
	todayCheckOut: string | null;
	hoursWorked: number;
	isLate: boolean;
	lateMinutes: number;
	yesterdayHours: number;
	comparisonText: string;
	timingDifference: string;
}

interface MorningReportData {
	organizationName: string;
	reportDate: string;
	organizationStartTime: string;
	summary: AttendanceSummary;
	punctuality: PunctualityBreakdown;
	presentEmployees: AttendanceReportUser[];
	absentEmployees: AttendanceReportUser[];
	insights: string[];
	recommendations: string[];
	generatedAt: string;
	dashboardUrl: string;
	hasEmployees: boolean;
}

interface EveningReportData {
	organizationName: string;
	reportDate: string;
	employeeMetrics: EmployeeAttendanceMetric[];
	presentEmployees: AttendanceReportUser[];
	absentEmployees: AttendanceReportUser[];
	summary: {
		totalEmployees: number;
		completedShifts: number;
		averageHours: number;
		totalOvertimeMinutes: number;
	};
	insights: string[];
	hasEmployees: boolean;
}

@Injectable()
export class AttendanceReportsService {
	private readonly logger = new Logger(AttendanceReportsService.name);

	constructor(
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Organisation)
		private organisationRepository: Repository<Organisation>,
		private readonly organizationHoursService: OrganizationHoursService,
		private readonly userService: UserService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	/**
	 * Schedule morning reports to run every 5 minutes and check if it's time to send
	 * Reports are sent 5 minutes after each organization's opening time
	 * This allows for dynamic scheduling based on each organization's start time
	 */
	@Cron('*/5 * * * *') // Run every 5 minutes for optimal balance of accuracy and performance
	async checkAndSendMorningReports() {
		try {
			const now = new Date();
			const organizations = await this.organisationRepository.find({
				where: { isDeleted: false },
			});

			for (const org of organizations) {
				await this.processMorningReportForOrganization(org, now);
			}
		} catch (error) {
			this.logger.error('Error in checkAndSendMorningReports:', error);
		}
	}

	/**
	 * Schedule evening reports to run every 30 minutes and check if it's time to send
	 * Reports are sent 30 minutes after each organization's closing time
	 * This allows for dynamic scheduling based on each organization's end time
	 */
	@Cron('*/30 * * * *')
	async checkAndSendEveningReports() {
		try {
			const now = new Date();
			const organizations = await this.organisationRepository.find({
				where: { isDeleted: false },
			});

			for (const org of organizations) {
				await this.processEveningReportForOrganization(org, now);
			}
		} catch (error) {
			this.logger.error('Error in checkAndSendEveningReports:', error);
		}
	}

	private async processMorningReportForOrganization(organization: Organisation, currentTime: Date) {
		try {
			const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(organization.uid, currentTime);

			if (!workingDayInfo.isWorkingDay || !workingDayInfo.startTime) {
				return; // Skip non-working days
			}

			// Calculate 5 minutes after start time
			const startTimeMinutes = TimeCalculatorUtil.timeToMinutes(workingDayInfo.startTime);
			const reportTimeMinutes = startTimeMinutes + 5;
			const currentTimeMinutes = TimeCalculatorUtil.timeToMinutes(currentTime.toTimeString().substring(0, 5));

			// Check if we're within 5 minutes of the report time (sufficient with 5-minute intervals)
			const timeDifference = Math.abs(currentTimeMinutes - reportTimeMinutes);
			if (timeDifference > 5) {
				return; // Not time yet or too late
			}

			// Check if we already sent a report today
			const today = startOfDay(currentTime);
			const cacheKey = `morning_report_${organization.uid}_${format(today, 'yyyy-MM-dd')}`;

			// Simple in-memory check - could be enhanced with Redis
			if (this.hasReportBeenSent(cacheKey)) {
				return;
			}

			await this.generateAndSendMorningReport(organization.uid);
			this.markReportAsSent(cacheKey);

			this.logger.log(`Morning report sent for organization ${organization.name} (ID: ${organization.uid})`);
		} catch (error) {
			this.logger.error(`Error processing morning report for organization ${organization.uid}:`, error);
		}
	}

	private async processEveningReportForOrganization(organization: Organisation, currentTime: Date) {
		try {
			const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(organization.uid, currentTime);

			if (!workingDayInfo.isWorkingDay || !workingDayInfo.endTime) {
				return; // Skip non-working days
			}

			// Calculate 30 minutes after end time
			const endTimeMinutes = TimeCalculatorUtil.timeToMinutes(workingDayInfo.endTime);
			const reportTimeMinutes = endTimeMinutes + 30;
			const currentTimeMinutes = TimeCalculatorUtil.timeToMinutes(currentTime.toTimeString().substring(0, 5));

			// Check if we're within 5 minutes of the report time
			const timeDifference = Math.abs(currentTimeMinutes - reportTimeMinutes);
			if (timeDifference > 5) {
				return; // Not time yet or too late
			}

			// Check if we already sent a report today
			const today = startOfDay(currentTime);
			const cacheKey = `evening_report_${organization.uid}_${format(today, 'yyyy-MM-dd')}`;

			if (this.hasReportBeenSent(cacheKey)) {
				return;
			}

			await this.generateAndSendEveningReport(organization.uid);
			this.markReportAsSent(cacheKey);

			this.logger.log(`Evening report sent for organization ${organization.name} (ID: ${organization.uid})`);
		} catch (error) {
			this.logger.error(`Error processing evening report for organization ${organization.uid}:`, error);
		}
	}

	private reportCache = new Set<string>();

	private hasReportBeenSent(cacheKey: string): boolean {
		return this.reportCache.has(cacheKey);
	}

	private markReportAsSent(cacheKey: string): void {
		this.reportCache.add(cacheKey);
		// Clean up after 24 hours
		setTimeout(() => this.reportCache.delete(cacheKey), 24 * 60 * 60 * 1000);
	}

	/**
	 * Generate and send morning attendance report
	 */
	async generateAndSendMorningReport(organizationId: number): Promise<void> {
		try {
			const reportData = await this.generateMorningReportData(organizationId);
			const recipients = await this.getReportRecipients(organizationId);

			if (recipients.length === 0) {
				this.logger.warn(`No recipients found for morning report - Organization ID: ${organizationId}`);
				return;
			}

			this.eventEmitter.emit('send.email', EmailType.ATTENDANCE_MORNING_REPORT, recipients, reportData);

			this.logger.log(
				`Morning attendance report generated and sent for organization ${organizationId} to ${recipients.length} recipients`,
			);
		} catch (error) {
			this.logger.error(`Error generating morning report for organization ${organizationId}:`, error);
			throw error;
		}
	}

	/**
	 * Generate and send evening attendance report
	 */
	async generateAndSendEveningReport(organizationId: number): Promise<void> {
		try {
			const reportData = await this.generateEveningReportData(organizationId);
			const recipients = await this.getReportRecipients(organizationId);

			if (recipients.length === 0) {
				this.logger.warn(`No recipients found for evening report - Organization ID: ${organizationId}`);
				return;
			}

			this.eventEmitter.emit('send.email', EmailType.ATTENDANCE_EVENING_REPORT, recipients, reportData);

			this.logger.log(
				`Evening attendance report generated and sent for organization ${organizationId} to ${recipients.length} recipients`,
			);
		} catch (error) {
			this.logger.error(`Error generating evening report for organization ${organizationId}:`, error);
			throw error;
		}
	}

	private async generateMorningReportData(organizationId: number): Promise<MorningReportData> {
		const today = new Date();
		const startOfToday = startOfDay(today);
		const endOfToday = endOfDay(today);

		// Get organization info
		const organization = await this.organisationRepository.findOne({
			where: { uid: organizationId },
		});

		// Get working day info for organization hours with fallback
		const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(organizationId, today);

		// Ensure we have valid start time with fallback
		const organizationStartTime = workingDayInfo.startTime || '09:00';

		// Get all users in the organization with better error handling
		let allUsers = [];
		let totalEmployees = 0;

		try {
			const usersResponse = await this.userService.findAll({ organisationId: organizationId }, 1, 1000);
			allUsers = usersResponse.data || [];
			totalEmployees = allUsers.length;
		} catch (error) {
			this.logger.warn(`Failed to fetch users for organization ${organizationId}:`, error);
		}

		// Get today's attendance records
		const todayAttendance = await this.attendanceRepository.find({
			where: {
				organisation: { uid: organizationId },
				checkIn: Between(startOfToday, endOfToday),
			},
			relations: ['owner', 'owner.userProfile', 'owner.branch'],
		});

		const presentCount = todayAttendance.length;
		const absentCount = totalEmployees - presentCount;
		const attendanceRate = totalEmployees > 0 ? (presentCount / totalEmployees) * 100 : 0;

		// Create present employees list
		const presentEmployees: AttendanceReportUser[] = todayAttendance.map(attendance => {
			const owner = attendance.owner;
			const fullName = `${owner.name || ''} ${owner.surname || ''}`.trim();
			return {
				uid: owner.uid,
				name: owner.name || 'Unknown',
				surname: owner.surname || 'User',
				fullName: fullName || 'Unknown User',
				email: owner.email || 'no-email@company.com',
				phone: owner.phone || undefined,
				role: owner.accessLevel || AccessLevel.USER,
				userProfile: {
					avatar: owner.photoURL || null,
				},
				branch: owner.branch
					? {
							uid: owner.branch.uid,
							name: owner.branch.name || 'Unknown Branch',
					  }
					: undefined,
			};
		});

		// Create absent employees list
		const presentUserIds = new Set(todayAttendance.map(att => att.owner?.uid));
		const absentEmployees: AttendanceReportUser[] = allUsers
			.filter(user => !presentUserIds.has(user.uid))
			.map(user => {
				const fullName = `${user.name || ''} ${user.surname || ''}`.trim();
				return {
					uid: user.uid,
					name: user.name || 'Unknown',
					surname: user.surname || 'User',
					fullName: fullName || 'Unknown User',
					email: user.email || 'no-email@company.com',
					phone: user.phone || undefined,
					role: user.accessLevel || AccessLevel.USER,
					userProfile: {
						avatar: user.photoURL || null,
					},
					branch: user.branch
						? {
								uid: user.branch.uid,
								name: user.branch.name || 'Unknown Branch',
						  }
						: undefined,
				};
			});

		// Generate punctuality breakdown
		const punctuality = await this.generatePunctualityBreakdown(organizationId, todayAttendance);

		// Generate insights and recommendations with enhanced logic for no employees
		const insights = this.generateMorningInsights(attendanceRate, punctuality, presentCount, totalEmployees);
		const recommendations = this.generateMorningRecommendations(punctuality, attendanceRate);

		return {
			organizationName: organization?.name || 'Organization',
			reportDate: format(today, 'EEEE, MMMM do, yyyy'),
			organizationStartTime,
			summary: {
				totalEmployees,
				presentCount,
				absentCount,
				attendanceRate: Math.round(attendanceRate * 100) / 100,
			},
			punctuality,
			presentEmployees,
			absentEmployees,
			insights,
			recommendations,
			generatedAt: format(today, 'yyyy-MM-dd HH:mm:ss'),
			dashboardUrl: process.env.APP_URL || 'https://loro.co.za',
			hasEmployees: totalEmployees > 0,
		};
	}

	private async generateEveningReportData(organizationId: number): Promise<EveningReportData> {
		const today = new Date();
		const startOfToday = startOfDay(today);
		const endOfToday = endOfDay(today);

		// Get organization info
		const organization = await this.organisationRepository.findOne({
			where: { uid: organizationId },
		});

		// Get all users in the organization with better error handling
		let allUsers = [];

		try {
			const usersResponse = await this.userService.findAll({ organisationId: organizationId }, 1, 1000);
			allUsers = usersResponse.data || [];
		} catch (error) {
			this.logger.warn(`Failed to fetch users for organization ${organizationId}:`, error);
		}

		// Find the most recent working day for comparison (smart yesterday logic)
		const { comparisonDate, comparisonLabel } = await this.findLastWorkingDay(organizationId, today);
		const startOfComparison = startOfDay(comparisonDate);
		const endOfComparison = endOfDay(comparisonDate);

		// Get today's and comparison day's attendance records
		const [todayAttendance, comparisonAttendance] = await Promise.all([
			this.attendanceRepository.find({
				where: {
					organisation: { uid: organizationId },
					checkIn: Between(startOfToday, endOfToday),
				},
				relations: ['owner', 'owner.userProfile', 'owner.branch'],
			}),
			this.attendanceRepository.find({
				where: {
					organisation: { uid: organizationId },
					checkIn: Between(startOfComparison, endOfComparison),
				},
				relations: ['owner'],
			}),
		]);

		// Create present employees list
		const presentEmployees: AttendanceReportUser[] = todayAttendance.map(attendance => {
			const owner = attendance.owner;
			const fullName = `${owner.name || ''} ${owner.surname || ''}`.trim();
			return {
				uid: owner.uid,
				name: owner.name || 'Unknown',
				surname: owner.surname || 'User',
				fullName: fullName || 'Unknown User',
				email: owner.email || 'no-email@company.com',
				phone: owner.phone || undefined,
				role: owner.accessLevel || AccessLevel.USER,
				userProfile: {
					avatar: owner.photoURL || null,
				},
				branch: owner.branch
					? {
							uid: owner.branch.uid,
							name: owner.branch.name || 'Unknown Branch',
					  }
					: undefined,
			};
		});

		// Create absent employees list
		const presentUserIds = new Set(todayAttendance.map(att => att.owner?.uid));
		const absentEmployees: AttendanceReportUser[] = allUsers
			.filter(user => !presentUserIds.has(user.uid))
			.map(user => {
				const fullName = `${user.name || ''} ${user.surname || ''}`.trim();
				return {
					uid: user.uid,
					name: user.name || 'Unknown',
					surname: user.surname || 'User',
					fullName: fullName || 'Unknown User',
					email: user.email || 'no-email@company.com',
					phone: user.phone || undefined,
					role: user.accessLevel || AccessLevel.USER,
					userProfile: {
						avatar: user.photoURL || null,
					},
					branch: user.branch
						? {
								uid: user.branch.uid,
								name: user.branch.name || 'Unknown Branch',
						  }
						: undefined,
				};
			});

		// Generate employee metrics with improved comparison logic
		const employeeMetrics = await this.generateEmployeeMetrics(
			organizationId,
			allUsers,
			todayAttendance,
			comparisonAttendance,
			comparisonLabel,
		);

		// Calculate summary statistics
		const completedShifts = todayAttendance.filter((a) => a.status === AttendanceStatus.COMPLETED).length;
		const totalHours = todayAttendance.reduce((sum, attendance) => {
			if (attendance.duration) {
				const minutes = this.parseDurationToMinutes(attendance.duration);
				return sum + minutes / 60;
			}
			return sum;
		}, 0);
		const avgHours = completedShifts > 0 ? totalHours / completedShifts : 0;

		const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(organizationId, today);
		const standardMinutes = workingDayInfo.expectedWorkMinutes;
		const totalOvertimeMinutes = todayAttendance.reduce((sum, attendance) => {
			if (attendance.duration) {
				const actualMinutes = this.parseDurationToMinutes(attendance.duration);
				return sum + Math.max(0, actualMinutes - standardMinutes);
			}
			return sum;
		}, 0);

		const insights = this.generateEveningInsights(employeeMetrics, completedShifts, avgHours);

		return {
			organizationName: organization?.name || 'Organization',
			reportDate: format(today, 'EEEE, MMMM do, yyyy'),
			employeeMetrics,
			presentEmployees,
			absentEmployees,
			summary: {
				totalEmployees: allUsers.length,
				completedShifts,
				averageHours: Math.round(avgHours * 100) / 100,
				totalOvertimeMinutes: Math.round(totalOvertimeMinutes),
			},
			insights,
			hasEmployees: allUsers.length > 0,
		};
	}

	private async generatePunctualityBreakdown(
		organizationId: number,
		todayAttendance: Attendance[],
	): Promise<PunctualityBreakdown> {
		const earlyArrivals: AttendanceReportUser[] = [];
		const onTimeArrivals: AttendanceReportUser[] = [];
		const lateArrivals: AttendanceReportUser[] = [];

		for (const attendance of todayAttendance) {
			if (!attendance.owner || !attendance.checkIn || !isValid(attendance.checkIn)) {
				continue;
			}

			// Defensive user profile handling to prevent mix-ups
			const owner = attendance.owner;
			const fullName = `${owner.name || ''} ${owner.surname || ''}`.trim();
			const user: AttendanceReportUser = {
				uid: owner.uid,
				name: owner.name || 'Unknown',
				surname: owner.surname || 'User',
				fullName: fullName || 'Unknown User',
				email: owner.email || 'no-email@company.com',
				phone: owner.phone || undefined,
				role: owner.accessLevel || AccessLevel.USER,
				userProfile: {
					avatar: owner.photoURL || null,
				},
				branch: owner.branch
					? {
							uid: owner.branch.uid,
							name: owner.branch.name || 'Unknown Branch',
					  }
					: undefined,
			};

			const lateInfo = await this.organizationHoursService.isUserLate(organizationId, attendance.checkIn);
			const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(
				organizationId,
				attendance.checkIn,
			);

			if (!workingDayInfo.startTime) {
				onTimeArrivals.push(user);
				continue;
			}

			const checkInMinutes = TimeCalculatorUtil.timeToMinutes(attendance.checkIn.toTimeString().substring(0, 5));
			const expectedStartMinutes = TimeCalculatorUtil.timeToMinutes(workingDayInfo.startTime);

			if (lateInfo.isLate) {
				lateArrivals.push(user);
			} else if (checkInMinutes < expectedStartMinutes) {
				earlyArrivals.push(user);
			} else {
				onTimeArrivals.push(user);
			}
		}

		const total = todayAttendance.length;

		return {
			earlyArrivals,
			onTimeArrivals,
			lateArrivals,
			earlyPercentage: total > 0 ? Math.round((earlyArrivals.length / total) * 100) : 0,
			onTimePercentage: total > 0 ? Math.round((onTimeArrivals.length / total) * 100) : 0,
			latePercentage: total > 0 ? Math.round((lateArrivals.length / total) * 100) : 0,
		};
	}

	private async generateEmployeeMetrics(
		organizationId: number,
		allUsers: Omit<User, 'password'>[],
		todayAttendance: Attendance[],
		comparisonAttendance: Attendance[],
		comparisonLabel: string = 'yesterday',
	): Promise<EmployeeAttendanceMetric[]> {
		const metrics: EmployeeAttendanceMetric[] = [];

		for (const user of allUsers) {
			const todayRecord = todayAttendance.find((a) => a.owner?.uid === user.uid);
			const comparisonRecord = comparisonAttendance.find((a) => a.owner?.uid === user.uid);

			const todayHours = todayRecord?.duration ? this.parseDurationToMinutes(todayRecord.duration) / 60 : 0;
			const comparisonHours = comparisonRecord?.duration
				? this.parseDurationToMinutes(comparisonRecord.duration) / 60
				: 0;

			let isLate = false;
			let lateMinutes = 0;

			if (todayRecord?.checkIn) {
				const lateInfo = await this.organizationHoursService.isUserLate(organizationId, todayRecord.checkIn);
				isLate = lateInfo.isLate;
				lateMinutes = lateInfo.lateMinutes;
			}

			const hoursDifference = todayHours - comparisonHours;
			let comparisonText = `Same as ${comparisonLabel}`;
			let timingDifference = '→';

			// Handle zero comparison hours with intelligent messaging
			if (comparisonHours === 0 && todayHours > 0) {
				comparisonText = `${Math.round(todayHours * 100) / 100}h worked (no data for ${comparisonLabel})`;
				timingDifference = '📊';
			} else if (comparisonHours === 0 && todayHours === 0) {
				comparisonText = `No work recorded for today or ${comparisonLabel}`;
				timingDifference = '⭕';
			} else if (hoursDifference > 0.5) {
				comparisonText = `${Math.round(hoursDifference * 100) / 100}h more than ${comparisonLabel}`;
				timingDifference = '↗️';
			} else if (hoursDifference < -0.5) {
				comparisonText = `${Math.round(Math.abs(hoursDifference) * 100) / 100}h less than ${comparisonLabel}`;
				timingDifference = '↘️';
			}

			// Defensive user profile creation to prevent data mix-ups
			const fullName = `${user.name || ''} ${user.surname || ''}`.trim();
			const reportUser: AttendanceReportUser = {
				uid: user.uid,
				name: user.name || 'Unknown',
				surname: user.surname || 'User',
				fullName: fullName || 'Unknown User',
				email: user.email || 'no-email@company.com',
				phone: user.phone || undefined,
				role: user.accessLevel || AccessLevel.USER,
				userProfile: {
					avatar: user.photoURL || null,
				},
				branch: user.branch
					? {
							uid: user.branch.uid,
							name: user.branch.name || 'Unknown Branch',
					  }
					: undefined,
			};

			metrics.push({
				user: reportUser,
				todayCheckIn: todayRecord?.checkIn ? format(todayRecord.checkIn, 'HH:mm') : null,
				todayCheckOut: todayRecord?.checkOut ? format(todayRecord.checkOut, 'HH:mm') : null,
				hoursWorked: Math.round(todayHours * 100) / 100,
				isLate,
				lateMinutes,
				yesterdayHours: Math.round(comparisonHours * 100) / 100,
				comparisonText,
				timingDifference,
			});
		}

		// Sort by hours worked (descending)
		return metrics.sort((a, b) => b.hoursWorked - a.hoursWorked);
	}

	private generateMorningInsights(
		attendanceRate: number,
		punctuality: PunctualityBreakdown,
		presentCount: number,
		totalEmployees: number,
	): string[] {
		const insights: string[] = [];

		// Special handling for no employees scenario
		if (totalEmployees === 0) {
			insights.push('No employees are registered in the system for this organization.');
			return insights;
		}

		// Special handling for no present employees
		if (presentCount === 0) {
			insights.push('No employees have checked in yet today. Consider following up with your team.');
			insights.push('This could indicate a system issue, public holiday, or scheduling changes.');
			return insights;
		}

		if (attendanceRate >= 90) {
			insights.push('Excellent attendance rate - team showing strong commitment!');
		} else if (attendanceRate >= 75) {
			insights.push('Good attendance rate - room for slight improvement.');
		} else {
			insights.push('Attendance rate needs attention - consider checking in with absent team members.');
		}

		if (punctuality.latePercentage > 25) {
			insights.push(`${punctuality.latePercentage}% of employees arrived late today.`);
		}

		if (punctuality.earlyPercentage > 50) {
			insights.push(`${punctuality.earlyPercentage}% of team members arrived early - showing great enthusiasm!`);
		}

		if (presentCount > 0) {
			insights.push(`${presentCount} team members have checked in so far today.`);
		}

		return insights;
	}

	private generateMorningRecommendations(punctuality: PunctualityBreakdown, attendanceRate: number): string[] {
		const recommendations: string[] = [];

		// Special handling for zero attendance
		if (attendanceRate === 0) {
			recommendations.push('Investigate why no employees have checked in today.');
			recommendations.push('Consider reaching out to team leaders to confirm work schedule.');
			recommendations.push('Check if there are any system issues preventing check-ins.');
			return recommendations;
		}

		if (punctuality.latePercentage > 20) {
			recommendations.push('Consider sending reminders about punctuality expectations.');
			recommendations.push('Review if start times are clearly communicated to all team members.');
		}

		if (attendanceRate < 80) {
			recommendations.push('Follow up with absent team members to ensure they are okay.');
			recommendations.push('Consider implementing an absence notification system.');
		}

		if (punctuality.onTimePercentage > 80) {
			recommendations.push('Recognize punctual team members for their consistency.');
		}

		if (punctuality.earlyPercentage > 30) {
			recommendations.push('Consider if early arrivals indicate scheduling issues or exceptional dedication.');
		}

		if (recommendations.length === 0) {
			recommendations.push('Great start to the day - keep up the excellent attendance habits!');
		}

		return recommendations;
	}

	private generateEveningInsights(
		employeeMetrics: EmployeeAttendanceMetric[],
		completedShifts: number,
		avgHours: number,
	): string[] {
		const insights: string[] = [];

		// Special handling for no employees
		if (employeeMetrics.length === 0) {
			insights.push('No employee data available for this organization.');
			return insights;
		}

		const lateEmployees = employeeMetrics.filter((m) => m.isLate).length;
		const highPerformers = employeeMetrics.filter((m) => m.hoursWorked > avgHours + 1).length;
		const noCheckOut = employeeMetrics.filter((m) => m.todayCheckIn && !m.todayCheckOut).length;

		// Special handling for no attendance
		if (completedShifts === 0 && employeeMetrics.every(m => !m.todayCheckIn)) {
			insights.push('No employees checked in today. Consider following up with your team.');
			insights.push('This could indicate a system issue, public holiday, or scheduling changes.');
			return insights;
		}

		if (completedShifts > 0) {
			insights.push(`${completedShifts} employees completed their shifts today.`);
		}

		if (avgHours > 0) {
			insights.push(`Average working hours: ${Math.round(avgHours * 100) / 100} hours.`);
		}

		if (lateEmployees > 0) {
			insights.push(`${lateEmployees} employees arrived late today.`);
		}

		if (highPerformers > 0) {
			insights.push(`${highPerformers} employees worked above average hours.`);
		}

		if (noCheckOut > 0) {
			insights.push(`${noCheckOut} employees haven't checked out yet.`);
		}

		return insights;
	}

	/**
	 * Find the last working day for comparison, accounting for weekends and organization schedule
	 */
	private async findLastWorkingDay(
		organizationId: number,
		currentDate: Date,
	): Promise<{
		comparisonDate: Date;
		comparisonLabel: string;
	}> {
		let comparisonDate = subDays(currentDate, 1);
		let daysBack = 1;
		const maxDaysBack = 7; // Limit search to avoid infinite loops

		// First, try to find the last working day based on organization schedule
		while (daysBack <= maxDaysBack) {
			const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(
				organizationId,
				comparisonDate,
			);

			if (workingDayInfo.isWorkingDay) {
				const label =
					daysBack === 1 ? 'yesterday' : daysBack === 2 ? 'day before yesterday' : `${daysBack} days ago`;
				return { comparisonDate, comparisonLabel: label };
			}

			daysBack++;
			comparisonDate = subDays(currentDate, daysBack);
		}

		// Fallback to business days if organization schedule isn't available
		try {
			comparisonDate = subBusinessDays(currentDate, 1);
			return { comparisonDate, comparisonLabel: 'last business day' };
		} catch (error) {
			// Ultimate fallback to yesterday
			return {
				comparisonDate: subDays(currentDate, 1),
				comparisonLabel: 'yesterday (may not be a working day)',
			};
		}
	}

	private async getReportRecipients(organizationId: number): Promise<string[]> {
		try {
			// Get users with OWNER, ADMIN, or HR access levels for the organization
			const ownerResult = await this.userService.findAll({
				organisationId: organizationId,
				accessLevel: AccessLevel.OWNER,
				status: AccountStatus.ACTIVE,
			});

			const adminResult = await this.userService.findAll({
				organisationId: organizationId,
				accessLevel: AccessLevel.ADMIN,
				status: AccountStatus.ACTIVE,
			});

			const hrResult = await this.userService.findAll({
				organisationId: organizationId,
				accessLevel: AccessLevel.HR,
				status: AccountStatus.ACTIVE,
			});

			// Combine all recipients
			const allRecipients = [...(ownerResult.data || []), ...(adminResult.data || []), ...(hrResult.data || [])];

			// Remove duplicates and filter for valid emails
			const uniqueRecipients = allRecipients.filter(
				(user, index, self) => user.email && self.findIndex((u) => u.uid === user.uid) === index,
			);

			return uniqueRecipients.map((user) => user.email);
		} catch (error) {
			this.logger.error(`Error getting report recipients for organization ${organizationId}:`, error);
			return [];
		}
	}

	/**
	 * Enhanced duration parser with multiple format support and validation
	 */
	private parseDurationToMinutes(duration: string): number {
		if (!duration || typeof duration !== 'string') return 0;

		const trimmed = duration.trim();
		if (trimmed === '0' || trimmed === '') return 0;

		try {
			// Handle format like "8h 30m", "8 hours 30 minutes", "8:30", etc.

			// Format: "HH:MM:SS" or "HH:MM"
			const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
			if (timeMatch) {
				const hours = parseInt(timeMatch[1], 10) || 0;
				const minutes = parseInt(timeMatch[2], 10) || 0;
				const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) || 0 : 0;
				return hours * 60 + minutes + Math.round(seconds / 60);
			}

			// Format: "8h 30m" or "8 hours 30 minutes" (flexible)
			const hourMinuteMatch = trimmed.match(
				/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/i,
			);
			if (hourMinuteMatch) {
				const hours = parseFloat(hourMinuteMatch[1]) || 0;
				const minutes = parseFloat(hourMinuteMatch[2]) || 0;
				return Math.round(hours * 60 + minutes);
			}

			// Format: just hours "8h" or "8 hours"
			const hourOnlyMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?$/i);
			if (hourOnlyMatch) {
				const hours = parseFloat(hourOnlyMatch[1]) || 0;
				return Math.round(hours * 60);
			}

			// Format: just minutes "45m" or "45 minutes"
			const minuteOnlyMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?$/i);
			if (minuteOnlyMatch) {
				const minutes = parseFloat(minuteOnlyMatch[1]) || 0;
				return Math.round(minutes);
			}

			// Format: decimal hours "8.5"
			const decimalMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
			if (decimalMatch) {
				const hours = parseFloat(decimalMatch[1]) || 0;
				return Math.round(hours * 60);
			}

			// Fallback: try to extract any numbers and assume they're hours
			const numbers = trimmed.match(/\d+(?:\.\d+)?/g);
			if (numbers && numbers.length > 0) {
				const firstNumber = parseFloat(numbers[0]) || 0;
				// If it's a reasonable hour value (0-24), treat as hours
				if (firstNumber <= 24) {
					return Math.round(firstNumber * 60);
				}
				// Otherwise, treat as minutes
				return Math.round(firstNumber);
			}

			this.logger.warn(`Unable to parse duration string: "${duration}"`);
			return 0;
		} catch (error) {
			this.logger.error(`Error parsing duration "${duration}":`, error);
			return 0;
		}
	}
}
