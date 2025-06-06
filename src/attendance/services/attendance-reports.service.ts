import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { startOfDay, endOfDay, format, differenceInMinutes, subDays } from 'date-fns';

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

interface AttendanceReportUser {
	uid: number;
	name: string;
	email: string;
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
	insights: string[];
	recommendations: string[];
	generatedAt: string;
	dashboardUrl: string;
}

interface EveningReportData {
	organizationName: string;
	reportDate: string;
	employeeMetrics: EmployeeAttendanceMetric[];
	summary: {
		totalEmployees: number;
		completedShifts: number;
		averageHours: number;
		totalOvertimeMinutes: number;
	};
	insights: string[];
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
	 * This allows for dynamic scheduling based on each organization's start time
	 */
	@Cron('*/5 * * * *')
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

			// Calculate 30 minutes after start time
			const startTimeMinutes = TimeCalculatorUtil.timeToMinutes(workingDayInfo.startTime);
			const reportTimeMinutes = startTimeMinutes + 30;
			const currentTimeMinutes = TimeCalculatorUtil.timeToMinutes(currentTime.toTimeString().substring(0, 5));

			// Check if we're within 5 minutes of the report time
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

		// Get working day info for organization hours
		const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(organizationId, today);

		// Get all users in the organization
		const usersResponse = await this.userService.findAll({ organisationId: organizationId }, 1, 1000);
		const allUsers = usersResponse.data;
		const totalEmployees = allUsers.length;

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

		// Generate punctuality breakdown
		const punctuality = await this.generatePunctualityBreakdown(organizationId, todayAttendance);

		// Generate insights and recommendations
		const insights = this.generateMorningInsights(attendanceRate, punctuality, presentCount, totalEmployees);
		const recommendations = this.generateMorningRecommendations(punctuality, attendanceRate);

		return {
			organizationName: organization?.name || 'Organization',
			reportDate: format(today, 'EEEE, MMMM do, yyyy'),
			organizationStartTime: workingDayInfo.startTime || '09:00',
			summary: {
				totalEmployees,
				presentCount,
				absentCount,
				attendanceRate: Math.round(attendanceRate * 100) / 100,
			},
			punctuality,
			insights,
			recommendations,
			generatedAt: format(today, 'yyyy-MM-dd HH:mm:ss'),
			dashboardUrl: process.env.APP_URL || 'https://loro.co.za',
		};
	}

	private async generateEveningReportData(organizationId: number): Promise<EveningReportData> {
		const today = new Date();
		const yesterday = subDays(today, 1);
		const startOfToday = startOfDay(today);
		const endOfToday = endOfDay(today);
		const startOfYesterday = startOfDay(yesterday);
		const endOfYesterday = endOfDay(yesterday);

		// Get organization info
		const organization = await this.organisationRepository.findOne({
			where: { uid: organizationId },
		});

		// Get all users in the organization
		const usersResponse = await this.userService.findAll({ organisationId: organizationId }, 1, 1000);
		const allUsers = usersResponse.data;

		// Get today's and yesterday's attendance records
		const [todayAttendance, yesterdayAttendance] = await Promise.all([
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
					checkIn: Between(startOfYesterday, endOfYesterday),
				},
				relations: ['owner'],
			}),
		]);

		// Generate employee metrics
		const employeeMetrics = await this.generateEmployeeMetrics(
			organizationId,
			allUsers,
			todayAttendance,
			yesterdayAttendance,
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
			summary: {
				totalEmployees: allUsers.length,
				completedShifts,
				averageHours: Math.round(avgHours * 100) / 100,
				totalOvertimeMinutes: Math.round(totalOvertimeMinutes),
			},
			insights,
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
			if (!attendance.owner || !attendance.checkIn) continue;

			const user: AttendanceReportUser = {
				uid: attendance.owner.uid,
				name: attendance.owner.name,
				email: attendance.owner.email,
				role: attendance.owner.accessLevel,
				userProfile: {
					avatar: attendance.owner.photoURL,
				},
				branch: attendance.owner.branch,
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
		yesterdayAttendance: Attendance[],
	): Promise<EmployeeAttendanceMetric[]> {
		const metrics: EmployeeAttendanceMetric[] = [];

		for (const user of allUsers) {
			const todayRecord = todayAttendance.find((a) => a.owner?.uid === user.uid);
			const yesterdayRecord = yesterdayAttendance.find((a) => a.owner?.uid === user.uid);

			const todayHours = todayRecord?.duration ? this.parseDurationToMinutes(todayRecord.duration) / 60 : 0;
			const yesterdayHours = yesterdayRecord?.duration
				? this.parseDurationToMinutes(yesterdayRecord.duration) / 60
				: 0;

			let isLate = false;
			let lateMinutes = 0;

			if (todayRecord?.checkIn) {
				const lateInfo = await this.organizationHoursService.isUserLate(organizationId, todayRecord.checkIn);
				isLate = lateInfo.isLate;
				lateMinutes = lateInfo.lateMinutes;
			}

			const hoursDifference = todayHours - yesterdayHours;
			let comparisonText = 'Same as yesterday';
			let timingDifference = '→';

			if (hoursDifference > 0.5) {
				comparisonText = `${Math.round(hoursDifference * 100) / 100}h more than yesterday`;
				timingDifference = '↗️';
			} else if (hoursDifference < -0.5) {
				comparisonText = `${Math.round(Math.abs(hoursDifference) * 100) / 100}h less than yesterday`;
				timingDifference = '↘️';
			}

			const reportUser: AttendanceReportUser = {
				uid: user.uid,
				name: user.name,
				email: user.email,
				role: user.accessLevel,
				userProfile: {
					avatar: user.photoURL,
				},
				branch: user.branch,
			};

			metrics.push({
				user: reportUser,
				todayCheckIn: todayRecord?.checkIn ? format(todayRecord.checkIn, 'HH:mm') : null,
				todayCheckOut: todayRecord?.checkOut ? format(todayRecord.checkOut, 'HH:mm') : null,
				hoursWorked: Math.round(todayHours * 100) / 100,
				isLate,
				lateMinutes,
				yesterdayHours: Math.round(yesterdayHours * 100) / 100,
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

		if (punctuality.latePercentage > 20) {
			recommendations.push('Consider sending reminders about punctuality expectations.');
		}

		if (attendanceRate < 80) {
			recommendations.push('Follow up with absent team members to ensure they are okay.');
		}

		if (punctuality.onTimePercentage > 80) {
			recommendations.push('Recognize punctual team members for their consistency.');
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

		const lateEmployees = employeeMetrics.filter((m) => m.isLate).length;
		const highPerformers = employeeMetrics.filter((m) => m.hoursWorked > avgHours + 1).length;
		const noCheckOut = employeeMetrics.filter((m) => m.todayCheckIn && !m.todayCheckOut).length;

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

	private parseDurationToMinutes(duration: string): number {
		if (!duration) return 0;

		// Handle format like "8h 30m" or "45m" or "2h"
		const hourMatch = duration.match(/(\d+)h/);
		const minuteMatch = duration.match(/(\d+)m/);

		const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
		const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

		return hours * 60 + minutes;
	}
}
