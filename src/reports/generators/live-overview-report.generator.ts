import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Not, Repository, LessThanOrEqual, IsNull, Raw } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Journal } from '../../journal/entities/journal.entity';
import { Client } from '../../clients/entities/client.entity';
import { CheckIn } from '../../check-ins/entities/check-in.entity';
import { Quotation } from '../../shop/entities/quotation.entity';
import { TaskStatus, TaskPriority, TaskType, TaskFlagStatus } from '../../lib/enums/task.enums';
import { LeadStatus, LeadCategory } from '../../lib/enums/lead.enums';
import { AttendanceStatus } from '../../lib/enums/attendance.enums';
import { startOfDay, endOfDay, format, differenceInMinutes, subHours, subDays, differenceInYears } from 'date-fns';
import { ReportParamsDto } from '../dto/report-params.dto';
import { Branch } from '../../branch/entities/branch.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { GeneralStatus } from '../../lib/enums/status.enums';
import { ClientRiskLevel } from '../../lib/enums/client.enums';
import { Product } from '../../products/entities/product.entity';
import { ProductAnalytics } from '../../products/entities/product-analytics.entity';
import { ProductStatus } from '../../lib/enums/product.enums';
import { Claim } from '../../claims/entities/claim.entity';
import { ClaimStatus, ClaimCategory } from '../../lib/enums/finance.enums';
import { TaskFlag } from '../../tasks/entities/task-flag.entity';
import { TaskFlagItem } from '../../tasks/entities/task-flag-item.entity';
import { UserProfile } from '../../user/entities/user.profile.entity';
import { License } from '../../licensing/entities/license.entity';

@Injectable()
export class LiveOverviewReportGenerator {
	private readonly logger = new Logger(LiveOverviewReportGenerator.name);

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
		@InjectRepository(Branch)
		private branchRepository: Repository<Branch>,
		@InjectRepository(Organisation)
		private organisationRepository: Repository<Organisation>,
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@InjectRepository(ProductAnalytics)
		private productAnalyticsRepository: Repository<ProductAnalytics>,
		@InjectRepository(Claim)
		private claimRepository: Repository<Claim>,
		@InjectRepository(TaskFlag)
		private taskFlagRepository: Repository<TaskFlag>,
		@InjectRepository(TaskFlagItem)
		private taskFlagItemRepository: Repository<TaskFlagItem>,
		@InjectRepository(UserProfile)
		private userProfileRepository: Repository<UserProfile>,
		@InjectRepository(License)
		private licenseRepository: Repository<License>,
	) {}

	async generate(params: ReportParamsDto): Promise<Record<string, any>> {
		try {
			const { organisationId, branchId, userId } = params;

			this.logger.log(`Generating live overview report for org ${organisationId}, branch ${branchId || 'all'}`);

			// Collect all metrics in parallel for better performance
			const [
				workforceMetrics,
				taskMetrics,
				leadMetrics,
				salesMetrics,
				clientMetrics,
				locationData,
				comprehensiveTaskMetrics,
				productMetrics,
				claimsMetrics,
				journalMetrics,
				taskFlagMetrics,
				licenseInfo,
				checkInSummary, // Added check-in summary
			] = await Promise.all([
				this.collectLiveWorkforceMetrics(organisationId, branchId),
				this.collectLiveTaskMetrics(organisationId, branchId),
				this.collectLiveLeadMetrics(organisationId, branchId),
				this.collectLiveSalesMetrics(organisationId, branchId),
				this.collectLiveClientMetrics(organisationId, branchId),
				this.collectLiveLocationData(organisationId, branchId),
				this.collectComprehensiveTaskMetrics(organisationId, branchId),
				this.collectProductMetrics(organisationId, branchId),
				this.collectClaimsMetrics(organisationId, branchId),
				this.collectJournalMetrics(organisationId, branchId),
				this.collectTaskFlagMetrics(organisationId, branchId),
				this.getLicenseInformation(organisationId), // Added license info fetching
				this.collectCheckInSummaryMetrics(organisationId, branchId), // Added check-in summary fetching
			]);

			return {
				name: 'Live Organization Overview',
				type: 'live_overview',
				generatedAt: new Date().toISOString(),
				filters: {
					organisationId,
					branchId,
				},
				generatedBy: {
					uid: userId || '1',
				},
				metadata: {
					reportType: 'live_overview',
					organisationId,
					branchId,
					generatedAt: new Date(),
					name: 'Live Organization Overview',
				},
				licenseInfo: licenseInfo, // Added license info
				summary: {
					totalEmployees: workforceMetrics.totalEmployees,
					activeEmployees: workforceMetrics.activeCount,
					attendancePercentage: workforceMetrics.attendancePercentage,
					totalHoursToday: workforceMetrics.totalHoursWorked,
					tasksCompletedToday: taskMetrics.completedToday,
					tasksInProgressCount: taskMetrics.inProgressCount,
					leadsGeneratedToday: leadMetrics.newLeadsToday,
					quotationsToday: salesMetrics.quotationsToday,
					revenueToday: salesMetrics.revenueToday,
					clientInteractionsToday: clientMetrics.interactionsToday,
					activeProducts: productMetrics.activeProductsCount,
					totalProductRevenue: productMetrics.totalRevenue,
					totalClaims: claimsMetrics.totalClaims,
					pendingClaims: claimsMetrics.pendingClaims,
					totalTaskFlags: taskFlagMetrics.totalFlags,
					openTaskFlags: taskFlagMetrics.openFlags,
					totalCheckInsToday: checkInSummary.totalCheckInsToday, // Added check-in summary
					// Add new workforce average metrics
					averageShiftDurationHours: workforceMetrics.averageShiftDurationHours,
					averageCheckInTime: workforceMetrics.averageCheckInTime,
					averageCheckOutTime: workforceMetrics.averageCheckOutTime,
					averageBreakDurationMinutes: workforceMetrics.averageBreakDurationMinutes,
				},
				metrics: {
					workforce: workforceMetrics,
					tasks: {
						...taskMetrics,
						comprehensive: comprehensiveTaskMetrics,
						flags: taskFlagMetrics,
					},
					leads: leadMetrics,
					sales: salesMetrics,
					clients: clientMetrics,
					locations: locationData,
					products: productMetrics,
					claims: claimsMetrics,
					journals: journalMetrics,
					checkIns: checkInSummary, // Added check-in summary
				},
			};
		} catch (error) {
			this.logger.error(`Error generating live overview report: ${error.message}`, error.stack);
			throw new Error(`Failed to generate live overview report: ${error.message}`);
		}
	}

	private async collectLiveWorkforceMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get all users with their profiles
			const users = await this.userRepository.find({
				where: { ...orgFilter, ...branchFilter },
				relations: ['userProfile'], // Eagerly load profile
			});

			const totalEmployees = users.length;

			// Workforce Demographics
			const demographics = {
				genderDistribution: {},
				ethnicityDistribution: {},
				maritalStatusDistribution: {},
				bodyTypeDistribution: {},
				smokingHabitsDistribution: {},
				ageDistribution: {},
			};

			users.forEach(user => {
				const profile = user.userProfile;
				if (profile) {
					// Gender
					const gender = profile.gender || 'Unknown';
					demographics.genderDistribution[gender] = (demographics.genderDistribution[gender] || 0) + 1;
					// Ethnicity
					const ethnicity = profile.ethnicity || 'Unknown';
					demographics.ethnicityDistribution[ethnicity] = (demographics.ethnicityDistribution[ethnicity] || 0) + 1;
					// Marital Status
					const maritalStatus = profile.maritalStatus || 'Unknown';
					demographics.maritalStatusDistribution[maritalStatus] = (demographics.maritalStatusDistribution[maritalStatus] || 0) + 1;
					// Body Type
					const bodyType = profile.bodyType || 'Unknown';
					demographics.bodyTypeDistribution[bodyType] = (demographics.bodyTypeDistribution[bodyType] || 0) + 1;
					// Smoking Habits
					const smokingHabits = profile.smokingHabits || 'Unknown';
					demographics.smokingHabitsDistribution[smokingHabits] = (demographics.smokingHabitsDistribution[smokingHabits] || 0) + 1;
					// Age (use currentAge if available, else calculate from dob)
					let age = profile.currentAge;
					if (!age && profile.dateOfBirth) {
						age = differenceInYears(today, new Date(profile.dateOfBirth));
					}
					if (age) {
						const ageRange = this.getAgeRange(age);
						demographics.ageDistribution[ageRange] = (demographics.ageDistribution[ageRange] || 0) + 1;
					} else {
						demographics.ageDistribution['Unknown'] = (demographics.ageDistribution['Unknown'] || 0) + 1;
					}
				}
			});

			// Get all employees who have records today (including those who have checked out)
			const allTodayAttendance = await this.attendanceRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					checkIn: MoreThanOrEqual(startOfToday),
				},
				relations: ['owner'],
			});

			// Get active employees (currently checked in)
			const activeEmployees = allTodayAttendance.filter(
				(employee) =>
					(employee.status === AttendanceStatus.PRESENT || employee.status === AttendanceStatus.ON_BREAK) &&
					employee.checkOut === null,
			);

			const activeCount = activeEmployees.length;

			// Get employees on break
			const employeesOnBreak = activeEmployees.filter(
				(employee) => employee.status === AttendanceStatus.ON_BREAK,
			);

			const onBreakCount = employeesOnBreak.length;

			// Calculate active working count (not on break)
			const activeWorkingCount = activeCount - onBreakCount;

			// Calculate attendance percentage
			const attendancePercentage = totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0;

			// Calculate total hours worked today
			let totalMinutesWorked = 0;

			// Get completed shifts for the day
			const completedShifts = allTodayAttendance.filter(
				(shift) => shift.status === AttendanceStatus.COMPLETED && shift.checkOut !== null,
			);

			// Calculate minutes from completed shifts
			completedShifts.forEach((shift) => {
				if (shift.checkIn && shift.checkOut) {
					const shiftMinutes = differenceInMinutes(new Date(shift.checkOut), new Date(shift.checkIn));

					// Subtract break time if available
					const breakMinutes = shift.totalBreakTime ? this.parseBreakTime(shift.totalBreakTime) : 0;

					totalMinutesWorked += shiftMinutes - breakMinutes;
				}
			});

			// Add time from active shifts
			activeEmployees.forEach((shift) => {
				if (shift.checkIn) {
					const activeMinutes = differenceInMinutes(new Date(), new Date(shift.checkIn));

					// Calculate break time
					let breakMinutes = 0;

					if (shift.breakDetails && shift.breakDetails.length > 0) {
						// Add completed breaks
						shift.breakDetails.forEach((breakDetail) => {
							if (breakDetail.startTime && breakDetail.endTime) {
								const breakStart = new Date(breakDetail.startTime);
								const breakEnd = new Date(breakDetail.endTime);
								breakMinutes += differenceInMinutes(breakEnd, breakStart);
							}
						});

						// Add current break if on break
						if (shift.status === AttendanceStatus.ON_BREAK && shift.breakStartTime) {
							const breakStart = new Date(shift.breakStartTime);
							breakMinutes += differenceInMinutes(new Date(), breakStart);
						}
					}
					// Fallback to totalBreakTime
					else if (shift.totalBreakTime) {
						breakMinutes = this.parseBreakTime(shift.totalBreakTime);
					}

					totalMinutesWorked += activeMinutes - breakMinutes;
				}
			});

			// Calculate total hours worked (rounded to 1 decimal)
			const totalHoursWorked = Math.round((totalMinutesWorked / 60) * 10) / 10;

			// Calculate productivity rate (active work time vs. break time)
			const totalBreakMinutes = this.calculateTotalBreakMinutes([...completedShifts, ...activeEmployees]);

			const totalWorkMinutes = totalMinutesWorked;
			const productivityRate =
				totalWorkMinutes + totalBreakMinutes > 0
					? Math.round((totalWorkMinutes / (totalWorkMinutes + totalBreakMinutes)) * 100)
					: 100;

			// Get hourly breakdown of check-ins
			const hourlyData = await this.getHourlyWorkforceData(organisationId, branchId, startOfToday);

			// Calculate additional attendance metrics
			const totalAttendanceRecordsToday = allTodayAttendance.length;
			const completedShiftsToday = completedShifts.length;

			let totalShiftDurationMinutes = 0;
			let totalCheckInMinutes = 0;
			let totalCheckOutMinutes = 0;
			let totalShiftBreakMinutes = 0;

			allTodayAttendance.forEach(shift => {
				if (shift.checkIn) {
					const checkInDate = new Date(shift.checkIn);
					totalCheckInMinutes += checkInDate.getHours() * 60 + checkInDate.getMinutes();
				}
			});

			completedShifts.forEach(shift => {
				if (shift.checkIn && shift.checkOut) {
					const checkInDate = new Date(shift.checkIn);
					const checkOutDate = new Date(shift.checkOut);
					totalShiftDurationMinutes += differenceInMinutes(checkOutDate, checkInDate);
					totalCheckOutMinutes += checkOutDate.getHours() * 60 + checkOutDate.getMinutes();
					// Use the previously calculated totalBreakMinutes logic per shift if needed, or parse totalBreakTime
					const breakMinutes = this.parseBreakTime(shift.totalBreakTime || '0h 0m');
					totalShiftBreakMinutes += breakMinutes;
				}
			});

			const averageShiftDurationHours = completedShiftsToday > 0
				? Math.round((totalShiftDurationMinutes / completedShiftsToday / 60) * 10) / 10
				: 0;

			const averageCheckInMinutes = totalAttendanceRecordsToday > 0
				? Math.round(totalCheckInMinutes / totalAttendanceRecordsToday)
				: 0;
			const averageCheckInTime = totalAttendanceRecordsToday > 0
				? `${String(Math.floor(averageCheckInMinutes / 60)).padStart(2, '0')}:${String(averageCheckInMinutes % 60).padStart(2, '0')}`
				: null;

			const averageCheckOutMinutes = completedShiftsToday > 0
				? Math.round(totalCheckOutMinutes / completedShiftsToday)
				: 0;
			const averageCheckOutTime = completedShiftsToday > 0
				? `${String(Math.floor(averageCheckOutMinutes / 60)).padStart(2, '0')}:${String(averageCheckOutMinutes % 60).padStart(2, '0')}`
				: null;

			const averageBreakDurationMinutes = completedShiftsToday > 0
				? Math.round(totalShiftBreakMinutes / completedShiftsToday)
				: 0;

			// Get all employees with attendance records today
			const employeesWithAttendanceToday = allTodayAttendance
				.filter(
					(record, index, self) =>
						// Deduplicate by employee ID
						index === self.findIndex((r) => r.owner?.uid === record.owner?.uid),
				)
				.map((record) => ({
					uid: record.owner?.uid,
					name: record.owner?.name,
					position: record.owner?.role || 'Staff',
					status: record.status,
					checkInTime: format(new Date(record.checkIn), 'HH:mm:ss'),
					checkOutTime: record.checkOut ? format(new Date(record.checkOut), 'HH:mm:ss') : null,
					breakCount: record.breakCount || 0,
					totalWorkTime: record.checkOut
						? Math.round(
								(differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn)) / 60) * 10,
						  ) / 10
						: Math.round((differenceInMinutes(new Date(), new Date(record.checkIn)) / 60) * 10) / 10,
					isActive: record.checkOut === null && record.status !== AttendanceStatus.COMPLETED,
				}));

			return {
				totalEmployees,
				activeCount,
				activeWorkingCount,
				onBreakCount,
				attendancePercentage,
				totalHoursWorked,
				productivityRate,
				hourlyData,
				employeesWithAttendanceToday,
				activeEmployees: activeEmployees.map((employee) => ({
					uid: employee.owner?.uid,
					name: employee.owner?.name,
					position: employee.owner?.role || 'Staff',
					status: employee.status,
					checkInTime: format(new Date(employee.checkIn), 'HH:mm:ss'),
					breakCount: employee.breakCount || 0,
					totalHoursToday: employee.checkIn
						? Math.round((differenceInMinutes(new Date(), new Date(employee.checkIn)) / 60) * 10) / 10
						: 0,
				})),
				demographics, // Include demographics
				// Add new attendance metrics
				totalAttendanceRecordsToday,
				completedShiftsToday,
				averageShiftDurationHours,
				averageCheckInTime,
				averageCheckOutTime,
				averageBreakDurationMinutes,
			};
		} catch (error) {
			this.logger.error(`Error collecting workforce metrics: ${error.message}`, error.stack);
			return {
				totalEmployees: 0,
				activeCount: 0,
				activeWorkingCount: 0,
				onBreakCount: 0,
				attendancePercentage: 0,
				totalHoursWorked: 0,
				productivityRate: 0,
				hourlyData: [],
				employeesWithAttendanceToday: [],
				activeEmployees: [],
				demographics: {
					genderDistribution: {},
					ethnicityDistribution: {},
					maritalStatusDistribution: {},
					bodyTypeDistribution: {},
					smokingHabitsDistribution: {},
					ageDistribution: {},
				},
				// Add default values for new metrics in catch block
				totalAttendanceRecordsToday: 0,
				completedShiftsToday: 0,
				averageShiftDurationHours: 0,
				averageCheckInTime: null,
				averageCheckOutTime: null,
				averageBreakDurationMinutes: 0,
			};
		}
	}

	// Helper to categorize age
	private getAgeRange(age: number): string {
		if (age < 18) return 'Under 18';
		if (age >= 18 && age <= 25) return '18-25';
		if (age >= 26 && age <= 35) return '26-35';
		if (age >= 36 && age <= 45) return '36-45';
		if (age >= 46 && age <= 55) return '46-55';
		if (age > 55) return 'Over 55';
		return 'Unknown';
	}

	private parseBreakTime(breakTime: string): number {
		try {
			// Format: "Xh Ym"
			const hours = parseInt(breakTime.split('h')[0].trim()) || 0;
			const minutes = parseInt(breakTime.split('h')[1].split('m')[0].trim()) || 0;
			return hours * 60 + minutes;
		} catch (error) {
			return 0;
		}
	}

	private calculateTotalBreakMinutes(shifts: Attendance[]): number {
		let totalBreakMinutes = 0;

		shifts.forEach((shift) => {
			// Use breakDetails if available
			if (shift.breakDetails && shift.breakDetails.length > 0) {
				shift.breakDetails.forEach((breakDetail) => {
					if (breakDetail.startTime && breakDetail.endTime) {
						const breakStart = new Date(breakDetail.startTime);
						const breakEnd = new Date(breakDetail.endTime);
						totalBreakMinutes += differenceInMinutes(breakEnd, breakStart);
					}
				});

				// Add current break if on break
				if (shift.status === AttendanceStatus.ON_BREAK && shift.breakStartTime) {
					const breakStart = new Date(shift.breakStartTime);
					totalBreakMinutes += differenceInMinutes(new Date(), breakStart);
				}
			}
			// Fallback to totalBreakTime
			else if (shift.totalBreakTime) {
				totalBreakMinutes += this.parseBreakTime(shift.totalBreakTime);
			}
		});

		return totalBreakMinutes;
	}

	private async getHourlyWorkforceData(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ hour: string; activeCount: number; checkIns: number; checkOuts: number }>> {
		// Create hourly buckets (0-23)
		const hourlyData = Array.from({ length: 24 }, (_, index) => ({
			hour: index.toString().padStart(2, '0'),
			activeCount: 0,
			checkIns: 0,
			checkOuts: 0,
		}));

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all attendance records for today
		const attendanceRecords = await this.attendanceRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				checkIn: MoreThanOrEqual(startDate),
			},
		});

		// Process check-ins
		attendanceRecords.forEach((record) => {
			if (record.checkIn) {
				const checkInHour = new Date(record.checkIn).getHours();
				hourlyData[checkInHour].checkIns++;
			}

			if (record.checkOut) {
				const checkOutHour = new Date(record.checkOut).getHours();
				hourlyData[checkOutHour].checkOuts++;
			}
		});

		// Calculate active counts for each hour
		// For demonstration, we'll count an employee as active from check-in until check-out
		const now = new Date();
		const currentHour = now.getHours();

		for (let hour = 0; hour < 24; hour++) {
			if (hour > currentHour) {
				// Future hours have no data yet
				continue;
			}

			// Count employees who checked in at or before this hour
			// and checked out after this hour (or haven't checked out yet)
			let activeCount = 0;

			attendanceRecords.forEach((record) => {
				const checkInHour = record.checkIn ? new Date(record.checkIn).getHours() : -1;
				const checkOutHour = record.checkOut ? new Date(record.checkOut).getHours() : 24;

				if (checkInHour <= hour && checkOutHour > hour) {
					activeCount++;
				}
			});

			hourlyData[hour].activeCount = activeCount;
		}

		return hourlyData;
	}

	private async collectLiveTaskMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Tasks completed today
			const completedToday = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.COMPLETED,
					completionDate: MoreThanOrEqual(startOfToday),
				},
			});

			// Tasks created today
			const createdToday = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(startOfToday),
				},
			});

			// Tasks in progress
			const inProgressCount = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.IN_PROGRESS,
				},
			});

			// Overdue tasks
			const overdueCount = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.OVERDUE,
				},
			});

			// Tasks due today (but not completed yet)
			const endOfToday = endOfDay(today);
			const dueTodayCount = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					deadline: Between(startOfToday, endOfToday),
					status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
				},
			});

			// Get total tasks count (all tasks)
			const totalTasksCount = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
				},
			});

			// Get total active tasks count (not completed or cancelled)
			const totalActiveTasksCount = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
				},
			});

			// Calculate completion rate for today
			const todayActiveTasks = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: Not(In([TaskStatus.CANCELLED])),
					createdAt: MoreThanOrEqual(startOfToday),
				},
			});

			const todayCompletionRate =
				todayActiveTasks > 0 ? Math.round((completedToday / todayActiveTasks) * 100) : 0;

			// Overall completion rate
			const totalCompletedTasks = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.COMPLETED,
				},
			});

			const overallCompletionRate =
				totalTasksCount > 0 ? Math.round((totalCompletedTasks / totalTasksCount) * 100) : 0;

			// Get task distribution by priority - count ALL tasks by priority
			const priorityDistribution = await this.getTaskPriorityDistribution(organisationId, branchId);

			// Get task distribution by status - count ALL tasks by status
			const statusDistribution = await this.getTaskStatusDistribution(organisationId, branchId);

			// Get hourly completion data
			const hourlyCompletions = await this.getHourlyTaskCompletions(organisationId, branchId, startOfToday);

			// Get recent completed tasks
			const recentCompletedTasks = await this.taskRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.COMPLETED,
					completionDate: MoreThanOrEqual(startOfToday),
				},
				relations: ['creator'],
				order: {
					completionDate: 'DESC',
				},
				take: 5,
			});

			// Get most active users
			const mostActiveUsers = await this.getMostActiveTaskUsers(organisationId, branchId, startOfToday);

			// Get upcoming tasks (due in the next 7 days)
			const next7Days = new Date();
			next7Days.setDate(next7Days.getDate() + 7);

			const upcomingTasks = await this.taskRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
					deadline: Between(startOfToday, endOfDay(next7Days)),
				},
				relations: ['creator'],
				order: {
					deadline: 'ASC',
				},
				take: 10,
			});

			return {
				completedToday,
				createdToday,
				inProgressCount,
				overdueCount,
				dueTodayCount,
				totalTasksCount,
				totalActiveTasksCount,
				todayCompletionRate,
				overallCompletionRate,
				priorityDistribution,
				statusDistribution,
				hourlyCompletions,
				mostActiveUsers,
				recentCompleted: recentCompletedTasks.map((task) => ({
					id: task.uid,
					title: task.title,
					completedById: task.assignees?.length > 0 && task.assignees[0]?.uid ? task.assignees[0].uid : null,
					completedBy: task.assignees?.length > 0 ? 'User #' + task.assignees[0].uid : 'Unknown',
					completedAt: task.completionDate ? format(new Date(task.completionDate), 'HH:mm:ss') : null,
					priority: task.priority,
				})),
				upcomingTasks: upcomingTasks.map((task) => ({
					id: task.uid,
					title: task.title,
					status: task.status,
					priority: task.priority,
					assignedToId: task.assignees?.length > 0 && task.assignees[0]?.uid ? task.assignees[0].uid : null,
					assignedTo: task.assignees?.length > 0 ? 'User #' + task.assignees[0].uid : 'Unassigned',
					deadline: task.deadline ? format(new Date(task.deadline), 'PP') : 'No deadline',
					daysRemaining: task.deadline
						? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
						: null,
				})),
			};
		} catch (error) {
			this.logger.error(`Error collecting task metrics: ${error.message}`, error.stack);
			return {
				completedToday: 0,
				createdToday: 0,
				inProgressCount: 0,
				overdueCount: 0,
				dueTodayCount: 0,
				totalTasksCount: 0,
				totalActiveTasksCount: 0,
				todayCompletionRate: 0,
				overallCompletionRate: 0,
				priorityDistribution: {
					high: 0,
					medium: 0,
					low: 0,
				},
				statusDistribution: {},
				hourlyCompletions: [],
				mostActiveUsers: [],
				recentCompleted: [],
				upcomingTasks: [],
			};
		}
	}

	private async getTaskPriorityDistribution(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Initialize result object
			const result: Record<string, any> = {
				all: {},
				active: {},
				completed: {},
			};

			// Count all tasks by priority
			for (const priority of Object.values(TaskPriority)) {
				// All tasks with this priority
				const totalCount = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						priority,
					},
				});

				// Active tasks with this priority (not completed or cancelled)
				const activeCount = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						priority,
						status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
					},
				});

				// Completed tasks with this priority
				const completedCount = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						priority,
						status: TaskStatus.COMPLETED,
					},
				});

				// Store counts
				result.all[priority.toLowerCase()] = totalCount;
				result.active[priority.toLowerCase()] = activeCount;
				result.completed[priority.toLowerCase()] = completedCount;
			}

			return result;
		} catch (error) {
			this.logger.error(`Error getting task priority distribution: ${error.message}`, error.stack);
			return {
				all: { high: 0, medium: 0, low: 0 },
				active: { high: 0, medium: 0, low: 0 },
				completed: { high: 0, medium: 0, low: 0 },
			};
		}
	}

	private async getTaskStatusDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Initialize result object
			const result: Record<string, number> = {};

			// Count tasks for each status
			for (const status of Object.values(TaskStatus)) {
				const count = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						status,
					},
				});

				result[status.toLowerCase()] = count;
			}

			return result;
		} catch (error) {
			this.logger.error(`Error getting task status distribution: ${error.message}`, error.stack);
			return {};
		}
	}

	private async getHourlyTaskCompletions(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ hour: string; count: number }>> {
		// Create hourly buckets (0-23)
		const hourlyData = Array.from({ length: 24 }, (_, index) => ({
			hour: index.toString().padStart(2, '0'),
			count: 0,
		}));

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get completed tasks for today
		const tasks = await this.taskRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				status: TaskStatus.COMPLETED,
				completionDate: MoreThanOrEqual(startDate),
			},
		});

		// Group tasks by completion hour
		tasks.forEach((task) => {
			if (task.completionDate) {
				const completionHour = new Date(task.completionDate).getHours();
				hourlyData[completionHour].count++;
			}
		});

		return hourlyData;
	}

	private async getMostActiveTaskUsers(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ userId: number; userName: string; userPhotoURL: string; completedCount: number }>> {
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all completed tasks with their assignees
		const tasks = await this.taskRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				status: TaskStatus.COMPLETED,
				completionDate: MoreThanOrEqual(startDate),
			},
		});

		// Count task completions per user
		const userCompletionMap = new Map<number, { count: number }>();

		tasks.forEach((task) => {
			if (task.assignees && task.assignees.length > 0) {
				const assignee = task.assignees[0]; // Take first assignee for simplicity
				const currentCount = userCompletionMap.get(assignee.uid)?.count || 0;

				userCompletionMap.set(assignee.uid, {
					count: currentCount + 1,
				});
			}
		});

		// Get user details for all assignees
		const assigneeIds = Array.from(userCompletionMap.keys());
		let userDetails: User[] = [];
		
		if (assigneeIds.length > 0) {
			userDetails = await this.userRepository.find({
				where: { uid: In(assigneeIds) },
				select: ['uid', 'name', 'photoURL'],
			});
		}
		
		// Create a map for quick lookup of user details
		const userMap = new Map<number, User>();
		userDetails.forEach(user => {
			userMap.set(user.uid, user);
		});

		// Convert map to array and sort by completion count
		const sortedUsers = Array.from(userCompletionMap.entries())
			.map(([userId, data]) => {
				const userDetail = userMap.get(userId);
				return {
					userId,
					userName: userDetail?.name || 'Unknown User',
					userPhotoURL: userDetail?.photoURL || '',
					completedCount: data.count,
				};
			})
			.sort((a, b) => b.completedCount - a.completedCount)
			.slice(0, 5); // Get top 5 users

		return sortedUsers;
	}

	private async collectLiveLeadMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// New leads captured today
			const newLeadsToday = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(startOfToday),
				},
			});

			// Leads converted today
			const convertedToday = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: LeadStatus.CONVERTED,
					updatedAt: MoreThanOrEqual(startOfToday),
				},
			});

			// Total active leads
			const activeLeadCount = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: Not(In([LeadStatus.CONVERTED, LeadStatus.CANCELLED, LeadStatus.DECLINED])),
				},
			});

			// Total pending leads
			const pendingLeadCount = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: LeadStatus.PENDING,
				},
			});

			// Calculate conversion rate for today
			const todayConversionRate = newLeadsToday > 0 ? Math.round((convertedToday / newLeadsToday) * 100) : 0;

			// Calculate overall conversion rate (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const leadsLast30Days = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(thirtyDaysAgo),
				},
			});

			const convertedLast30Days = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: LeadStatus.CONVERTED,
					updatedAt: MoreThanOrEqual(thirtyDaysAgo),
				},
			});

			const overallConversionRate =
				leadsLast30Days > 0 ? Math.round((convertedLast30Days / leadsLast30Days) * 100) : 0;

			// Get hourly lead capture data
			const hourlyData = await this.getHourlyLeadData(organisationId, branchId, startOfToday);

			// Get most productive lead generators
			const topLeadGenerators = await this.getTopLeadGenerators(organisationId, branchId, startOfToday);

			// Get all active leads (not just today's)
			const allActiveLeads = await this.leadRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					status: Not(In([LeadStatus.CONVERTED, LeadStatus.CANCELLED, LeadStatus.DECLINED])),
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
				take: 50,
			});

			// Get recent leads from today
			const recentLeads = await this.leadRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(startOfToday),
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
				take: 10,
			});

			// Get lead statuses distribution
			const statusDistribution = await this.getLeadStatusDistribution(organisationId, branchId);

			// Calculate leads by category/type
			const leadsByCategory = await this.getLeadsByCategoryDistribution(organisationId, branchId);

			return {
				newLeadsToday,
				convertedToday,
				activeLeadCount,
				pendingLeadCount,
				todayConversionRate,
				overallConversionRate,
				hourlyData,
				topLeadGenerators,
				statusDistribution,
				leadsByCategory,
				allActiveLeads: allActiveLeads.map((lead) => ({
					id: lead.uid,
					name: lead.name || 'Unnamed Lead',
					status: lead.status,
					createdBy: lead.owner?.name || 'Unknown',
					createdAt: format(new Date(lead.createdAt), 'PP'),
					hasContactInfo: !!(lead.email || lead.phone),
					phone: lead.phone,
					email: lead.email,
					category: (lead as any).category || 'Uncategorized',
					value: (lead as any).estimatedValue || 0,
				})),
				recentLeads: recentLeads.map((lead) => ({
					id: lead.uid,
					name: lead.name || 'Unnamed Lead',
					status: lead.status,
					createdBy: lead.owner?.name || 'Unknown',
					createdAt: format(new Date(lead.createdAt), 'HH:mm:ss'),
					hasContactInfo: !!(lead.email || lead.phone),
					phone: lead.phone,
					email: lead.email,
				})),
			};
		} catch (error) {
			this.logger.error(`Error collecting lead metrics: ${error.message}`, error.stack);
			return {
				newLeadsToday: 0,
				convertedToday: 0,
				activeLeadCount: 0,
				pendingLeadCount: 0,
				todayConversionRate: 0,
				overallConversionRate: 0,
				hourlyData: [],
				topLeadGenerators: [],
				statusDistribution: {},
				leadsByCategory: {},
				allActiveLeads: [],
				recentLeads: [],
			};
		}
	}

	private async getLeadsByCategoryDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		try {
			// Initialize result with all lead categories
			const result: Record<string, number> = {
				'Uncategorized': 0,
				'Walk-in': 0,
				'Referral': 0,
				'Website': 0,
				'Phone': 0,
				'Email': 0,
				'Social Media': 0,
			};

			// Map enum values to display names for the frontend
			const categoryDisplayMap: Record<string, string> = {
				[LeadCategory.OTHER]: 'Uncategorized',
				[LeadCategory.WALK_IN]: 'Walk-in',
				[LeadCategory.REFERRAL]: 'Referral',
				[LeadCategory.WEBSITE]: 'Website',
				[LeadCategory.PHONE]: 'Phone',
				[LeadCategory.EMAIL]: 'Email',
				[LeadCategory.SOCIAL_MEDIA]: 'Social Media',
				[LeadCategory.BUSINESS]: 'Business',
				[LeadCategory.PERSONAL]: 'Personal',
			};

			// Get all leads
			const leads = await this.leadRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
				},
				select: ['category']
			});

			// Count leads by category
			leads.forEach(lead => {
				const displayCategory = categoryDisplayMap[lead.category] || 'Uncategorized';
				result[displayCategory] = (result[displayCategory] || 0) + 1;
			});

			return result;
		} catch (error) {
			this.logger.error(`Error collecting lead category distribution: ${error.message}`, error.stack);
			return {};
		}
	}

	private async getHourlyLeadData(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ hour: string; newLeads: number; converted: number }>> {
		// Create hourly buckets (0-23)
		const hourlyData = Array.from({ length: 24 }, (_, index) => ({
			hour: index.toString().padStart(2, '0'),
			newLeads: 0,
			converted: 0,
		}));

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all leads created or converted today
		const allLeads = await this.leadRepository.find({
			where: [
				{ ...orgFilter, ...branchFilter, createdAt: MoreThanOrEqual(startDate) },
				{
					...orgFilter,
					...branchFilter,
					status: LeadStatus.CONVERTED,
					updatedAt: MoreThanOrEqual(startDate),
				},
			],
		});

		// Group leads by creation and conversion hours
		allLeads.forEach((lead) => {
			// Count new leads
			if (lead.createdAt && lead.createdAt >= startDate) {
				const creationHour = new Date(lead.createdAt).getHours();
				hourlyData[creationHour].newLeads++;
			}

			// Count converted leads
			if (lead.status === LeadStatus.CONVERTED && lead.updatedAt && lead.updatedAt >= startDate) {
				const conversionHour = new Date(lead.updatedAt).getHours();
				hourlyData[conversionHour].converted++;
			}
		});

		return hourlyData;
	}

	private async getTopLeadGenerators(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ userId: number; userName: string; userPhotoURL: string; leadCount: number; conversionRate: number }>> {
		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all leads with their creators - remove date filter to count all leads
		const leads = await this.leadRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				// Remove the date filter to count all leads per user
				// createdAt: MoreThanOrEqual(startDate),
			},
			relations: ['owner'],
		});

		// Group leads by creator
		const leadsByUser = new Map<
			number,
			{
				total: number;
				converted: number;
				photoURL?: string;
				name: string;
			}
		>();

		leads.forEach((lead) => {
			if (lead.owner) {
				const userId = lead.owner.uid;
				const currentData = leadsByUser.get(userId) || {
					name: lead.owner.name,
					photoURL: lead.owner.photoURL,
					total: 0,
					converted: 0,
				};

				// Increment total count
				currentData.total++;

				// Increment converted count if applicable
				if (lead.status === LeadStatus.CONVERTED) {
					currentData.converted++;
				}

				leadsByUser.set(userId, currentData);
			}
		});

		// Convert map to array and calculate conversion rates
		const result = Array.from(leadsByUser.entries())
			.map(([userId, data]) => ({
				userId,
				userName: data.name,
				userPhotoURL: data.photoURL || '',
				leadCount: data.total,
				conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
			}))
			.sort((a, b) => b.leadCount - a.leadCount)
			.slice(0, 5); // Get top 5 users

		return result;
	}

	private async getLeadStatusDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Initialize result object with all statuses
		const result: Record<string, number> = {};

		// For each lead status, get the count
		const statuses = Object.values(LeadStatus);

		for (const status of statuses) {
			const count = await this.leadRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status,
				},
			});

			result[status] = count;
		}

		return result;
	}

	private async collectLiveSalesMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);
			const thirtyDaysAgo = subDays(today, 30);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get quotations created today
			const quotations = await this.quotationRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(startOfToday),
				},
				relations: ['quotationItems', 'placedBy', 'client'],
			});

			// Get all pending quotations (not just today's)
			const pendingQuotations = await this.quotationRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					status: In(['PENDING', 'PENDING_INTERNAL', 'PENDING_CLIENT', 'NEGOTIATION']),
				},
				relations: ['quotationItems', 'placedBy', 'client'],
				order: {
					createdAt: 'DESC',
				},
				take: 30,
			});

			const quotationsToday = quotations.length;

			// Calculate total revenue from today's quotations
			let totalRevenueToday = 0;

			quotations.forEach((quotation) => {
				const amount =
					typeof quotation.totalAmount === 'string'
						? parseFloat(quotation.totalAmount)
						: quotation.totalAmount;

				totalRevenueToday += Number.isNaN(amount) ? 0 : amount;
			});

			// Calculate total pending revenue
			let totalPendingRevenue = 0;

			pendingQuotations.forEach((quotation) => {
				const amount =
					typeof quotation.totalAmount === 'string'
						? parseFloat(quotation.totalAmount)
						: quotation.totalAmount;

				totalPendingRevenue += Number.isNaN(amount) ? 0 : amount;
			});

			// Calculate average order value
			const averageOrderValue =
				quotationsToday > 0 ? Math.round((totalRevenueToday / quotationsToday) * 100) / 100 : 0;

			// Format the total revenue with currency symbol
			const totalRevenueFormatted = new Intl.NumberFormat('en-ZA', {
				style: 'currency',
				currency: 'ZAR',
			}).format(totalRevenueToday);

			const pendingRevenueFormatted = new Intl.NumberFormat('en-ZA', {
				style: 'currency',
				currency: 'ZAR',
			}).format(totalPendingRevenue);

			// Get hourly sales data
			const hourlySales = await this.getHourlySalesData(organisationId, branchId, startOfToday);

			// Get top performers
			const topPerformers = await this.getTopSalesPerformers(organisationId, branchId, startOfToday);

			// Calculate week-over-week growth
			const previousWeekRevenue = await this.getPreviousWeekRevenue(organisationId, branchId);
			const previousWeekSameDay = await this.getPreviousWeekSameDayRevenue(organisationId, branchId);

			// Calculate week-over-week growth percentage
			const dayOverDayGrowth =
				previousWeekSameDay > 0
					? Math.round(((totalRevenueToday - previousWeekSameDay) / previousWeekSameDay) * 100)
					: totalRevenueToday > 0
					? 100
					: 0;

			return {
				quotationsToday,
				totalItemsToday: quotations.reduce((acc, q) => acc + (q.totalItems || 0), 0),
				revenueToday: totalRevenueToday,
				revenueFormatted: totalRevenueFormatted,
				pendingQuotationsCount: pendingQuotations.length,
				pendingRevenue: totalPendingRevenue,
				pendingRevenueFormatted: pendingRevenueFormatted,
				averageOrderValue,
				dayOverDayGrowth,
				previousWeekRevenue,
				hourlySales,
				topPerformers,
				recentQuotations: quotations
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
					.slice(0, 5)
					.map((quotation) => ({
						id: quotation.uid,
						quotationNumber: quotation.quotationNumber,
						clientName: quotation.client ? quotation.client.name : 'Unknown',
						amount:
							typeof quotation.totalAmount === 'string'
								? parseFloat(quotation.totalAmount)
								: quotation.totalAmount,
						itemCount: quotation.totalItems,
						createdBy: quotation.placedBy ? quotation.placedBy.name : 'Unknown',
						createdAt: format(new Date(quotation.createdAt), 'HH:mm:ss'),
					})),
				pendingQuotations: pendingQuotations.slice(0, 5).map((quotation) => ({
					id: quotation.uid,
					quotationNumber: quotation.quotationNumber,
					clientName: quotation.client ? quotation.client.name : 'Unknown',
					amount:
						typeof quotation.totalAmount === 'string'
							? parseFloat(quotation.totalAmount)
							: quotation.totalAmount,
					formattedAmount: new Intl.NumberFormat('en-ZA', {
						style: 'currency',
						currency: 'ZAR',
					}).format(
						typeof quotation.totalAmount === 'string'
							? parseFloat(quotation.totalAmount)
							: quotation.totalAmount || 0,
					),
					itemCount: quotation.totalItems,
					status: quotation.status,
					createdBy: quotation.placedBy ? quotation.placedBy.name : 'Unknown',
					createdAt: format(new Date(quotation.createdAt), 'PP'),
				})),
			};
		} catch (error) {
			this.logger.error(`Error collecting sales metrics: ${error.message}`, error.stack);
			return {
				quotationsToday: 0,
				totalItemsToday: 0,
				revenueToday: 0,
				revenueFormatted: 'R0.00',
				averageOrderValue: 0,
				dayOverDayGrowth: 0,
				previousWeekRevenue: 0,
				pendingQuotationsCount: 0,
				pendingRevenue: 0,
				pendingRevenueFormatted: 'R0.00',
				hourlySales: [],
				topPerformers: [],
				recentQuotations: [],
				pendingQuotations: [],
			};
		}
	}

	private async getHourlySalesData(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ hour: string; quotations: number; revenue: number }>> {
		// Create hourly buckets (0-23)
		const hourlyData = Array.from({ length: 24 }, (_, index) => ({
			hour: index.toString().padStart(2, '0'),
			quotations: 0,
			revenue: 0,
		}));

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all quotations for today
		const quotations = await this.quotationRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				createdAt: MoreThanOrEqual(startDate),
			},
		});

		// Group quotations by hour
		quotations.forEach((quotation) => {
			const hour = new Date(quotation.createdAt).getHours();

			hourlyData[hour].quotations++;

			const amount =
				typeof quotation.totalAmount === 'string' ? parseFloat(quotation.totalAmount) : quotation.totalAmount;

			hourlyData[hour].revenue += Number.isNaN(amount) ? 0 : amount;
		});

		return hourlyData;
	}

	private async getTopSalesPerformers(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ userId: number; userName: string; userPhotoURL: string; quotations: number; revenue: number }>> {
		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all quotations with their creators
		const quotations = await this.quotationRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				createdAt: MoreThanOrEqual(startDate),
			},
			relations: ['placedBy'],
		});

		// Group quotations by user
		const userMap = new Map<
			number,
			{
				name: string;
				photoURL: string;
				quotations: number;
				revenue: number;
			}
		>();

		quotations.forEach((quotation) => {
			if (quotation.placedBy) {
				const userId = quotation.placedBy.uid;
				const currentData = userMap.get(userId) || {
					name: quotation.placedBy.name,
					photoURL: quotation.placedBy.photoURL || '',
					quotations: 0,
					revenue: 0,
				};

				// Increment quotation count
				currentData.quotations++;

				// Add to revenue
				const amount =
					typeof quotation.totalAmount === 'string'
						? parseFloat(quotation.totalAmount)
						: quotation.totalAmount;

				currentData.revenue += Number.isNaN(amount) ? 0 : amount;

				userMap.set(userId, currentData);
			}
		});

		// Convert map to array and sort by revenue
		const result = Array.from(userMap.entries())
			.map(([userId, data]) => ({
				userId,
				userName: data.name,
				userPhotoURL: data.photoURL,
				quotations: data.quotations,
				revenue: data.revenue,
			}))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5); // Get top 5 performers

		return result;
	}

	private async getPreviousWeekRevenue(organisationId: number, branchId?: number): Promise<number> {
		// Calculate date range for previous week
		const today = new Date();
		const oneWeekAgo = new Date(today);
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const startOfPreviousWeek = startOfDay(oneWeekAgo);
		const endOfPreviousWeek = endOfDay(today);

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all quotations for previous week
		const quotations = await this.quotationRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				createdAt: Between(startOfPreviousWeek, endOfPreviousWeek),
			},
		});

		// Calculate total revenue
		let totalRevenue = 0;

		quotations.forEach((quotation) => {
			const amount =
				typeof quotation.totalAmount === 'string' ? parseFloat(quotation.totalAmount) : quotation.totalAmount;

			totalRevenue += Number.isNaN(amount) ? 0 : amount;
		});

		return totalRevenue;
	}

	private async getPreviousWeekSameDayRevenue(organisationId: number, branchId?: number): Promise<number> {
		// Get the same day of previous week
		const today = new Date();
		const sameDayLastWeek = new Date(today);
		sameDayLastWeek.setDate(sameDayLastWeek.getDate() - 7);

		const startOfDayLastWeek = startOfDay(sameDayLastWeek);
		const endOfDayLastWeek = endOfDay(sameDayLastWeek);

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all quotations for the same day last week
		const quotations = await this.quotationRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				createdAt: Between(startOfDayLastWeek, endOfDayLastWeek),
			},
		});

		// Calculate total revenue
		let totalRevenue = 0;

		quotations.forEach((quotation) => {
			const amount =
				typeof quotation.totalAmount === 'string' ? parseFloat(quotation.totalAmount) : quotation.totalAmount;

			totalRevenue += Number.isNaN(amount) ? 0 : amount;
		});

		return totalRevenue;
	}

	private async collectLiveClientMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);
			const thirtyDaysAgo = subDays(today, 30);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// New clients added today
			const newClientsToday = await this.clientRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(startOfToday),
				},
			});

			// New clients added in the last 30 days
			const newClientsLast30Days = await this.clientRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(thirtyDaysAgo),
				},
			});

			// Client check-ins today
			const clientCheckIns = await this.checkInRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					checkInTime: MoreThanOrEqual(startOfToday),
				},
				relations: ['client', 'owner'],
			});

			const interactionsToday = clientCheckIns.length;

			// Count unique clients interacted with
			const uniqueClientIds = new Set(
				clientCheckIns.filter((checkIn) => checkIn.client).map((checkIn) => checkIn.client.uid),
			);

			const uniqueClientsCount = uniqueClientIds.size;

			// Get total client count
			const totalClientCount = await this.clientRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
				},
			});

			// Calculate client engagement rate
			const clientEngagementRate =
				totalClientCount > 0 ? Math.round((uniqueClientsCount / totalClientCount) * 100) : 0;

			// Client status distribution
			const activeClientsCount = await this.clientRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: GeneralStatus.ACTIVE,
				},
			});

			const inactiveClientsCount = await this.clientRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: GeneralStatus.INACTIVE,
				},
			});

			// Client type/category distribution
			const clientsByCategory = await this.getClientCategoryDistribution(organisationId, branchId);

			// Get clients by industry
			const clientsByIndustry = await this.getClientIndustryDistribution(organisationId, branchId);

			// Get clients by risk level
			const clientsByRiskLevel = await this.getClientRiskLevelDistribution(organisationId, branchId);

			// Get hourly client interaction data
			const hourlyData = await this.getHourlyClientData(organisationId, branchId, startOfToday);

			// Get recent clients (added in last 30 days)
			const recentClients = await this.clientRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(thirtyDaysAgo),
				},
				order: {
					createdAt: 'DESC',
				},
				take: 20,
			});

			// Get top staff with most client interactions
			const topStaff = await this.getTopClientInteractionStaff(organisationId, branchId, startOfToday);

			// Get recent client interactions
			const recentInteractions = clientCheckIns
				.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
				.slice(0, 5)
				.map((checkIn) => ({
					id: checkIn.uid,
					clientName: checkIn.client ? checkIn.client.name : 'Unknown',
					clientId: checkIn.client ? checkIn.client.uid : null,
					staffName: checkIn?.owner?.username ? checkIn.owner.username : 'Unknown',
					staffId: checkIn?.owner?.uid || null,
					time: format(new Date(checkIn.checkInTime), 'HH:mm:ss'),
					location: checkIn.checkInLocation || 'Unknown location',
					notes: (checkIn as any).notes || '',
					purpose: (checkIn as any).purpose || 'General Visit',
				}));

			return {
				newClientsToday,
				newClientsLast30Days,
				interactionsToday,
				uniqueClientsCount,
				totalClientCount,
				activeClientsCount,
				inactiveClientsCount,
				clientEngagementRate,
				clientsByCategory,
				clientsByIndustry,
				clientsByRiskLevel,
				hourlyData,
				topStaff,
				recentClients: recentClients.map((client) => ({
					id: client.uid,
					name: client.name,
					contactPerson: client.contactPerson,
					email: client.email,
					phone: client.phone,
					status: client.status,
					createdAt: format(new Date(client.createdAt), 'PP'),
					city: client.address?.city || '',
					industry: client.industry || 'Unknown',
					riskLevel: client.riskLevel || 'low',
				})),
				recentInteractions,
			};
		} catch (error) {
			this.logger.error(`Error collecting client metrics: ${error.message}`, error.stack);
			return {
				newClientsToday: 0,
				newClientsLast30Days: 0,
				interactionsToday: 0,
				uniqueClientsCount: 0,
				totalClientCount: 0,
				activeClientsCount: 0,
				inactiveClientsCount: 0,
				clientEngagementRate: 0,
				clientsByCategory: {},
				clientsByIndustry: {},
				clientsByRiskLevel: {},
				hourlyData: [],
				topStaff: [],
				recentClients: [],
				recentInteractions: [],
			};
		}
	}

	private async getClientCategoryDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		try {
			// Get all clients
			const clients = await this.clientRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
				},
				select: ['category'],
			});

			// Get unique categories
			const uniqueCategories = [...new Set(clients.map((client) => client.category || 'Other'))];
			const result: Record<string, number> = {};

			// Count clients by category
			for (const category of uniqueCategories) {
				const count = await this.clientRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						category: category === 'Other' ? IsNull() : category,
					},
				});
				result[category] = count;
			}

			return result;
		} catch (error) {
			this.logger.error(`Error calculating client categories: ${error.message}`, error.stack);
			return { Other: 0 };
		}
	}

	private async getClientIndustryDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		try {
			// Get all clients
			const clients = await this.clientRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
				},
				select: ['industry'],
			});

			// Get unique industries
			const uniqueIndustries = [...new Set(clients.map((client) => client.industry || 'Other'))];
			const result: Record<string, number> = {};

			// Count clients by industry
			for (const industry of uniqueIndustries) {
				const count = await this.clientRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						industry: industry === 'Other' ? IsNull() : industry,
					},
				});
				result[industry] = count;
			}

			return result;
		} catch (error) {
			this.logger.error(`Error calculating client industries: ${error.message}`, error.stack);
			return { Other: 0 };
		}
	}

	private async getClientRiskLevelDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		try {
			// Get all clients by risk level
			const result: Record<string, number> = {};

			// Get count for each risk level
			for (const riskLevel of Object.values(ClientRiskLevel)) {
				const count = await this.clientRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						riskLevel,
					},
				});
				result[riskLevel] = count;
			}

			return result;
		} catch (error) {
			this.logger.error(`Error calculating client risk levels: ${error.message}`, error.stack);
			return { low: 0, medium: 0, high: 0, critical: 0 };
		}
	}

	private async getHourlyClientData(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ hour: string; interactions: number; uniqueClients: number }>> {
		// Create hourly buckets (0-23)
		const hourlyData = Array.from({ length: 24 }, (_, index) => ({
			hour: index.toString().padStart(2, '0'),
			interactions: 0,
			uniqueClients: 0,
		}));

		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all client check-ins for today
		const checkIns = await this.checkInRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				checkInTime: MoreThanOrEqual(startDate),
			},
			relations: ['client'],
		});

		// Track unique clients per hour
		const uniqueClientsPerHour = new Map<number, Set<number>>();

		// Initialize sets for each hour
		for (let i = 0; i < 24; i++) {
			uniqueClientsPerHour.set(i, new Set());
		}

		// Process check-ins
		checkIns.forEach((checkIn) => {
			const hour = new Date(checkIn.checkInTime).getHours();
			hourlyData[hour].interactions++;

			if (checkIn.client) {
				uniqueClientsPerHour.get(hour)?.add(checkIn.client.uid);
			}
		});

		// Update unique client counts
		for (let i = 0; i < 24; i++) {
			hourlyData[i].uniqueClients = uniqueClientsPerHour.get(i)?.size || 0;
		}

		return hourlyData;
	}

	private async getTopClientInteractionStaff(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<Array<{ userId: number; userName: string; userPhotoURL: string; interactions: number; uniqueClients: number }>> {
		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get all check-ins with their users
		const checkIns = await this.checkInRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				checkInTime: MoreThanOrEqual(startDate),
			},
			relations: ['owner', 'client'],
		});

		// Group check-ins by user
		const userMap = new Map<
			number,
			{
				name: string;
				photoURL: string;
				interactions: number;
				clients: Set<number>;
			}
		>();

		checkIns.forEach((checkIn) => {
			if (checkIn?.owner) {
				const userId = checkIn.owner.uid;
				const currentData = userMap.get(userId) || {
					name: checkIn.owner.name || checkIn.owner.username || 'Unknown',
					photoURL: checkIn.owner.photoURL || '',
					interactions: 0,
					clients: new Set<number>(),
				};

				// Increment interaction count
				currentData.interactions++;

				// Add client to unique set if exists
				if (checkIn.client) {
					currentData.clients.add(checkIn.client.uid);
				}

				userMap.set(userId, currentData);
			}
		});

		// Convert map to array and calculate unique clients count
		const result = Array.from(userMap.entries())
			.map(([userId, data]) => ({
				userId,
				userName: data.name,
				userPhotoURL: data.photoURL,
				interactions: data.interactions,
				uniqueClients: data.clients.size,
			}))
			.sort((a, b) => b.interactions - a.interactions)
			.slice(0, 5); // Get top 5 staff

		return result;
	}

	private async collectLiveLocationData(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get all active attendance records with location data
			const activeAttendance = await this.attendanceRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					status: In([AttendanceStatus.PRESENT, AttendanceStatus.ON_BREAK]),
					checkIn: MoreThanOrEqual(startOfToday),
					checkOut: IsNull(),
				},
				relations: ['owner', 'branch'],
			});

			// Filter for records with location data
			const recordsWithLocation = activeAttendance.filter(
				(record) => record?.checkInLatitude && record?.checkInLongitude,
			);

			// Get branch locations for reference
			const branches = await this.branchRepository.find({
				where: {
					...orgFilter,
				},
			});

			// Prepare employee locations data
			const employeeLocations = recordsWithLocation.map((record) => ({
				userId: record.owner?.uid,
				userName: record.owner?.name,
				position: record.owner?.role || 'Staff',
				status: record.status,
				latitude: record.checkInLatitude,
				longitude: record.checkInLongitude,
				locationName: 'Coming soon',
				checkInTime: format(new Date(record.checkIn), 'HH:mm:ss'),
				branchName: record.branch?.name || 'No Branch',
			}));

			// Group employees by location for heatmap
			const locationClusters = this.calculateLocationClusters(recordsWithLocation);

			// Create branch location markers
			const branchLocations = branches
				.filter((branch) => branch?.address)
				.map((branch) => ({
					branchId: branch.uid,
					branchName: branch.name,
					address: branch.address || 'No address',
					employeeCount: activeAttendance.filter((a) => a.branch && a.branch.uid === branch.uid).length,
				}));

			// Get check-in locations for today (includes client locations)
			const checkInLocations = await this.getCheckInLocations(organisationId, branchId, startOfToday);

			return {
				employeeLocations,
				branchLocations,
				checkInLocations,
				locationClusters,
				employeesWithLocation: recordsWithLocation.length,
				totalActiveEmployees: activeAttendance.length,
				locationCoverage:
					activeAttendance.length > 0
						? Math.round((recordsWithLocation.length / activeAttendance.length) * 100)
						: 0,
			};
		} catch (error) {
			this.logger.error(`Error collecting location data: ${error.message}`, error.stack);
			return {
				employeeLocations: [],
				branchLocations: [],
				checkInLocations: [],
				locationClusters: [],
				employeesWithLocation: 0,
				totalActiveEmployees: 0,
				locationCoverage: 0,
			};
		}
	}

	private calculateLocationClusters(attendanceRecords: Attendance[]): Array<{
		latitude: number;
		longitude: number;
		count: number;
		employees: Array<{ id: number; name: string }>;
	}> {
		// Group nearby coordinates (simple implementation)
		const clusters: Array<{
			latitude: number;
			longitude: number;
			count: number;
			employees: Array<{ id: number; name: string }>;
		}> = [];

		// Define proximity threshold (approximately 100 meters in coordinate units)
		const proximityThreshold = 0.001;

		attendanceRecords.forEach((record) => {
			if (!record?.checkInLatitude || !record?.checkInLongitude || !record?.owner) {
				return;
			}

			const lat = record?.checkInLatitude;
			const lng = record?.checkInLongitude;

			// Check if this location is near an existing cluster
			let foundCluster = false;

			for (const cluster of clusters) {
				const distance = Math.sqrt(Math.pow(cluster.latitude - lat, 2) + Math.pow(cluster.longitude - lng, 2));

				if (distance < proximityThreshold) {
					// Add to existing cluster
					cluster.count++;
					cluster.employees.push({
						id: record.owner.uid,
						name: record.owner.name,
					});
					foundCluster = true;
					break;
				}
			}

			if (!foundCluster) {
				// Create new cluster
				clusters.push({
					latitude: lat,
					longitude: lng,
					count: 1,
					employees: [
						{
							id: record.owner.uid,
							name: record.owner.name,
						},
					],
				});
			}
		});

		return clusters;
	}

	private async getCheckInLocations(
		organisationId: number,
		branchId?: number,
		startDate = startOfDay(new Date()),
	): Promise<
		Array<{
			latitude: number;
			longitude: number;
			locationName: string;
			clientName?: string;
			userName: string;
			time: string;
			type: string;
		}>
	> {
		// Create base filters
		const orgFilter = { organisation: { uid: organisationId } };
		const branchFilter = branchId ? { branch: { uid: branchId } } : {};

		// Get client check-ins with location data
		const checkIns = await this.checkInRepository.find({
			where: {
				...orgFilter,
				...branchFilter,
				checkInTime: MoreThanOrEqual(startDate),
			},
			relations: ['client', 'owner'],
		});

		// Filter for records with location data
		const locationsData = checkIns
			.filter((checkIn) => checkIn?.checkInLocation)
			.map((checkIn) => ({
				latitude: 0,
				longitude: 0,
				locationName: checkIn?.checkInLocation || 'Unknown location',
				clientName: checkIn?.client ? checkIn?.client.name : undefined,
				userName: checkIn?.owner ? checkIn?.owner.username : 'Unknown',
				time: format(new Date(checkIn.checkInTime), 'HH:mm:ss'),
				type: 'client_check_in',
			}));

		return locationsData;
	}

	/**
	 * Collects comprehensive task metrics including historical data and advanced analytics
	 * This method extends task metrics beyond the current day to provide a complete picture
	 */
	private async collectComprehensiveTaskMetrics(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Historical timeframes
			const lastWeekStart = subDays(startOfToday, 7);
			const lastMonthStart = subDays(startOfToday, 30);
			const lastQuarterStart = subDays(startOfToday, 90);

			// 1. Task Volume Trends
			// Weekly volume
			const weeklyTaskVolume = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(lastWeekStart),
				},
			});

			// Monthly volume
			const monthlyTaskVolume = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(lastMonthStart),
				},
			});

			// Quarterly volume
			const quarterlyTaskVolume = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(lastQuarterStart),
				},
			});

			// 2. Completion Rate Trends
			// Weekly completion rate
			const weeklyCompletedTasks = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.COMPLETED,
					completionDate: MoreThanOrEqual(lastWeekStart),
				},
			});

			const weeklyCompletionRate =
				weeklyTaskVolume > 0 ? Math.round((weeklyCompletedTasks / weeklyTaskVolume) * 100) : 0;

			// Monthly completion rate
			const monthlyCompletedTasks = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.COMPLETED,
					completionDate: MoreThanOrEqual(lastMonthStart),
				},
			});

			const monthlyCompletionRate =
				monthlyTaskVolume > 0 ? Math.round((monthlyCompletedTasks / monthlyTaskVolume) * 100) : 0;

			// Quarterly completion rate
			const quarterlyCompletedTasks = await this.taskRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: TaskStatus.COMPLETED,
					completionDate: MoreThanOrEqual(lastQuarterStart),
				},
			});

			const quarterlyCompletionRate =
				quarterlyTaskVolume > 0 ? Math.round((quarterlyCompletedTasks / quarterlyTaskVolume) * 100) : 0;

			// 3. Task Aging Analysis
			// Get tasks by age in each status
			const taskAging = await this.getTaskAgingAnalysis(organisationId, branchId);

			// 4. Priority-based analysis
			const priorityAnalysis = await this.getTaskPriorityAnalysis(organisationId, branchId);

			// 5. Task Type Distribution
			const taskTypeDistribution = await this.getTaskTypeDistribution(organisationId, branchId);

			// 6. Assignee Performance Metrics
			const assigneePerformance = await this.getAssigneePerformanceMetrics(organisationId, branchId);

			// 7. Workload Distribution
			const workloadDistribution = await this.getWorkloadDistribution(organisationId, branchId);

			return {
				volumeTrends: {
					weekly: weeklyTaskVolume,
					monthly: monthlyTaskVolume,
					quarterly: quarterlyTaskVolume,
				},
				completionRates: {
					weekly: weeklyCompletionRate,
					monthly: monthlyCompletionRate,
					quarterly: quarterlyCompletionRate,
					weeklyCount: weeklyCompletedTasks,
					monthlyCount: monthlyCompletedTasks,
					quarterlyCount: quarterlyCompletedTasks,
				},
				taskAging,
				priorityAnalysis,
				taskTypeDistribution,
				assigneePerformance,
				workloadDistribution,
			};
		} catch (error) {
			this.logger.error(`Error collecting comprehensive task metrics: ${error.message}`, error.stack);
			return {
				volumeTrends: {
					weekly: 0,
					monthly: 0,
					quarterly: 0,
				},
				completionRates: {
					weekly: 0,
					monthly: 0,
					quarterly: 0,
					weeklyCount: 0,
					monthlyCount: 0,
					quarterlyCount: 0,
				},
				taskAging: {},
				priorityAnalysis: {},
				taskTypeDistribution: {},
				assigneePerformance: [],
				workloadDistribution: [],
			};
		}
	}

	/**
	 * Analyze how long tasks stay in each status
	 */
	private async getTaskAgingAnalysis(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Define age buckets in days
			const ageBuckets = {
				'1-7_days': { min: 1, max: 7 },
				'8-14_days': { min: 8, max: 14 },
				'15-30_days': { min: 15, max: 30 },
				'31-60_days': { min: 31, max: 60 },
				'60+_days': { min: 61, max: 999 },
			};

			const result: Record<string, any> = {};
			const now = new Date();

			// For each task status, get aging distribution
			for (const status of Object.values(TaskStatus)) {
				// Skip COMPLETED and CANCELLED for aging analysis
				if (status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED) {
					continue;
				}

				const statusTasks = await this.taskRepository.find({
					where: {
						...orgFilter,
						...branchFilter,
						status,
					},
					select: ['uid', 'createdAt', 'updatedAt'],
				});

				const agingDistribution: Record<string, number> = {};

				// Initialize buckets
				Object.keys(ageBuckets).forEach((bucket) => {
					agingDistribution[bucket] = 0;
				});

				// Count tasks in each bucket
				statusTasks.forEach((task) => {
					const ageInDays = Math.floor(
						(now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 3600 * 24),
					);

					for (const [bucketName, range] of Object.entries(ageBuckets)) {
						if (ageInDays >= range.min && ageInDays <= range.max) {
							agingDistribution[bucketName]++;
							break;
						}
					}
				});

				result[status] = {
					count: statusTasks.length,
					distribution: agingDistribution,
				};
			}

			return result;
		} catch (error) {
			this.logger.error(`Error analyzing task aging: ${error.message}`, error.stack);
			return {};
		}
	}

	/**
	 * Get priority-based task analysis
	 */
	private async getTaskPriorityAnalysis(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			const today = new Date();
			const lastMonthStart = subDays(today, 30);

			const result: Record<string, any> = {};

			// For each priority level
			for (const priority of Object.values(TaskPriority)) {
				// Get tasks created in last 30 days with this priority
				const tasksWithPriority = await this.taskRepository.find({
					where: {
						...orgFilter,
						...branchFilter,
						priority,
						createdAt: MoreThanOrEqual(lastMonthStart),
					},
					select: ['uid', 'status', 'createdAt', 'completionDate'],
				});

				const completedTasks = tasksWithPriority.filter(
					(task) => task.status === TaskStatus.COMPLETED && task.completionDate,
				);

				// Calculate average completion time in hours
				let avgCompletionTime = 0;
				if (completedTasks.length > 0) {
					const totalCompletionTime = completedTasks.reduce((sum, task) => {
						const createdAt = new Date(task.createdAt).getTime();
						const completedAt = new Date(task.completionDate).getTime();
						return sum + (completedAt - createdAt) / (1000 * 60 * 60); // Convert to hours
					}, 0);
					avgCompletionTime = Math.round(totalCompletionTime / completedTasks.length);
				}

				// Calculate completion rate
				const completionRate =
					tasksWithPriority.length > 0
						? Math.round((completedTasks.length / tasksWithPriority.length) * 100)
						: 0;

				result[priority] = {
					totalCount: tasksWithPriority.length,
					completedCount: completedTasks.length,
					completionRate,
					avgCompletionTimeHours: avgCompletionTime,
				};
			}

			return result;
		} catch (error) {
			this.logger.error(`Error analyzing task priorities: ${error.message}`, error.stack);
			return {};
		}
	}

	/**
	 * Get task distribution by type
	 */
	private async getTaskTypeDistribution(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			const result: Record<string, any> = {};

			// For each task type
			for (const taskType of Object.values(TaskType)) {
				const count = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						taskType,
					},
				});

				const completedCount = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						taskType,
						status: TaskStatus.COMPLETED,
					},
				});

				result[taskType] = {
					totalCount: count,
					completedCount,
					completionRate: count > 0 ? Math.round((completedCount / count) * 100) : 0,
				};
			}

			return result;
		} catch (error) {
			this.logger.error(`Error analyzing task types: ${error.message}`, error.stack);
			return {};
		}
	}

	/**
	 * Get performance metrics by assignee
	 */
	private async getAssigneePerformanceMetrics(organisationId: number, branchId?: number): Promise<any[]> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			const lastMonthStart = subDays(new Date(), 30);

			// Get all tasks with assignees in the last 30 days
			const tasks = await this.taskRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					createdAt: MoreThanOrEqual(lastMonthStart),
				},
				select: ['uid', 'assignees', 'status', 'createdAt', 'completionDate', 'priority'],
			});

			// Create a map to track assignee metrics
			const assigneeMap: Record<number, any> = {};

			// Process each task
			tasks.forEach((task) => {
				if (!task.assignees || task.assignees.length === 0) return;

				// We'll use the first assignee for simplicity
				const assigneeId = task.assignees[0]?.uid;

				// Initialize assignee record if not exists
				if (!assigneeMap[assigneeId]) {
					assigneeMap[assigneeId] = {
						assigneeId,
						totalTasks: 0,
						completedTasks: 0,
						highPriorityTasks: 0,
						highPriorityCompleted: 0,
						avgCompletionTimeHours: 0,
						totalCompletionTimeHours: 0,
					};
				}

				// Update assignee metrics
				assigneeMap[assigneeId].totalTasks++;

				if (task.status === TaskStatus.COMPLETED) {
					assigneeMap[assigneeId].completedTasks++;

					if (task.completionDate) {
						const completionTime =
							(new Date(task.completionDate).getTime() - new Date(task.createdAt).getTime()) /
							(1000 * 60 * 60);
						assigneeMap[assigneeId].totalCompletionTimeHours += completionTime;
					}
				}

				if (task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT) {
					assigneeMap[assigneeId].highPriorityTasks++;

					if (task.status === TaskStatus.COMPLETED) {
						assigneeMap[assigneeId].highPriorityCompleted++;
					}
				}
			});

			// Get user details for all assignees
			const assigneeIds = Object.keys(assigneeMap).map(id => parseInt(id, 10));
			let userDetails: User[] = [];
			
			if (assigneeIds.length > 0) {
				userDetails = await this.userRepository.find({
					where: { uid: In(assigneeIds) },
					select: ['uid', 'name', 'photoURL'],
				});
			}
			
			// Create a map for quick lookup of user details
			const userMap = new Map<number, User>();
			userDetails.forEach(user => {
				userMap.set(user.uid, user);
			});

			// Calculate averages and rates
			return Object.values(assigneeMap)
				.map((assignee) => {
					// Calculate completion rate
					const completionRate =
						assignee.totalTasks > 0 ? Math.round((assignee.completedTasks / assignee.totalTasks) * 100) : 0;

					// Calculate average completion time
					const avgCompletionTime =
						assignee.completedTasks > 0
							? Math.round(assignee.totalCompletionTimeHours / assignee.completedTasks)
							: 0;

					// Calculate high priority completion rate
					const highPriorityCompletionRate =
						assignee.highPriorityTasks > 0
							? Math.round((assignee.highPriorityCompleted / assignee.highPriorityTasks) * 100)
							: 0;
							
					// Get user details from our map
					const userDetail = userMap.get(assignee.assigneeId);

					return {
						assigneeId: assignee.assigneeId,
						assigneeName: userDetail?.name || 'Unknown User',
						assigneePhotoURL: userDetail?.photoURL || '',
						totalTasks: assignee.totalTasks,
						completedTasks: assignee.completedTasks,
						completionRate,
						avgCompletionTimeHours: avgCompletionTime,
						highPriorityTasks: assignee.highPriorityTasks,
						highPriorityCompleted: assignee.highPriorityCompleted,
						highPriorityCompletionRate: highPriorityCompletionRate,
					};
				})
				.sort((a, b) => b.totalTasks - a.totalTasks)
				.slice(0, 10); // Return top 10 by total tasks
		} catch (error) {
			this.logger.error(`Error analyzing assignee performance: ${error.message}`, error.stack);
			return [];
		}
	}

	/**
	 * Get workload distribution among users
	 */
	private async getWorkloadDistribution(organisationId: number, branchId?: number): Promise<any[]> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get all active users with name and photo details
			const users = await this.userRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
				},
				select: ['uid', 'name', 'photoURL'],
			});

			const result = [];

			// For each user, get their active tasks
			for (const user of users) {
				const activeTasks = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						assignees: Raw(value => `JSON_CONTAINS(${value}, '{"uid": ${user.uid}}')`),
						status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
					},
				});

				const pendingTasks = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						assignees: Raw(value => `JSON_CONTAINS(${value}, '{"uid": ${user.uid}}')`),
						status: TaskStatus.PENDING,
					},
				});

				const inProgressTasks = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						assignees: Raw(value => `JSON_CONTAINS(${value}, '{"uid": ${user.uid}}')`),
						status: TaskStatus.IN_PROGRESS,
					},
				});

				const overdueTasks = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						assignees: Raw(value => `JSON_CONTAINS(${value}, '{"uid": ${user.uid}}')`),
						status: TaskStatus.OVERDUE,
					},
				});

				const highPriorityTasks = await this.taskRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						assignees: Raw(value => `JSON_CONTAINS(${value}, '{"uid": ${user.uid}}')`),
						status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
						priority: In([TaskPriority.HIGH, TaskPriority.URGENT]),
					},
				});

				// Only include users with at least one task
				if (activeTasks > 0) {
					result.push({
						userId: user.uid,
						userName: user.name || 'Unknown User',
						userPhotoURL: user.photoURL || '',
						activeTasks,
						pendingTasks,
						inProgressTasks,
						overdueTasks,
						highPriorityTasks,
						workloadScore: this.calculateWorkloadScore(
							pendingTasks,
							inProgressTasks,
							overdueTasks,
							highPriorityTasks,
						),
					});
				}
			}

			// Sort by workload score (highest first)
			return result.sort((a, b) => b.workloadScore - a.workloadScore);
		} catch (error) {
			this.logger.error(`Error analyzing workload distribution: ${error.message}`, error.stack);
			return [];
		}
	}

	/**
	 * Calculate a workload score based on task counts and priorities
	 * This is a simple weighted formula that can be adjusted
	 */
	private calculateWorkloadScore(pending: number, inProgress: number, overdue: number, highPriority: number): number {
		// Weights for different types of tasks
		const PENDING_WEIGHT = 1;
		const IN_PROGRESS_WEIGHT = 1.5;
		const OVERDUE_WEIGHT = 2.5;
		const HIGH_PRIORITY_WEIGHT = 2;

		return Math.round(
			pending * PENDING_WEIGHT +
				inProgress * IN_PROGRESS_WEIGHT +
				overdue * OVERDUE_WEIGHT +
				highPriority * HIGH_PRIORITY_WEIGHT,
		);
	}

	/**
	 * Collect product-related metrics including performance analytics
	 */
	private async collectProductMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// 1. Basic product statistics
			const totalProductsCount = await this.productRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
			});

			const activeProductsCount = await this.productRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: ProductStatus.ACTIVE,
					isDeleted: false,
				},
			});

			const newProductsCount = await this.productRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: ProductStatus.NEW,
					isDeleted: false,
				},
			});

			const outOfStockCount = await this.productRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: ProductStatus.OUTOFSTOCK,
					isDeleted: false,
				},
			});

			const bestSellersCount = await this.productRepository.count({
				where: {
					...orgFilter,
					...branchFilter,
					status: ProductStatus.BEST_SELLER,
					isDeleted: false,
				},
			});

			// 2. Low stock alerts (products near reorder point)
			const lowStockProducts = await this.productRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				select: ['uid', 'name', 'sku', 'stockQuantity', 'reorderPoint', 'category'],
			});

			const lowStockAlerts = lowStockProducts
				.filter((product) => product.stockQuantity <= product.reorderPoint)
				.map((product) => ({
					id: product.uid,
					name: product.name,
					sku: product.sku,
					currentStock: product.stockQuantity,
					reorderPoint: product.reorderPoint,
					category: product.category,
				}))
				.slice(0, 10); // Limit to top 10 alerts

			// 3. Product category distribution
			const categoryDistribution = await this.getProductCategoryDistribution(organisationId, branchId);

			// 4. Status distribution
			const statusDistribution = await this.getProductStatusDistribution(organisationId, branchId);

			// 5. Top performing products by revenue
			const topPerformingProducts = await this.getTopPerformingProducts(organisationId, branchId);

			// 6. Latest products
			const latestProducts = await this.productRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				order: {
					createdAt: 'DESC',
				},
				select: ['uid', 'name', 'price', 'category', 'stockQuantity', 'status', 'createdAt'],
				take: 5,
			});

			// 7. Product analytics summary
			const productAnalyticsSummary = await this.getProductAnalyticsSummary(organisationId, branchId);

			// 8. Calculate total inventory value
			const inventoryValue = await this.calculateTotalInventoryValue(organisationId, branchId);

			// 9. Calculate total revenue from product sales
			const totalRevenue = productAnalyticsSummary.totalRevenue || 0;

			// 10. Promotion metrics
			const promotionMetrics = await this.getPromotionMetrics(organisationId, branchId);

			return {
				totalProductsCount,
				activeProductsCount,
				newProductsCount,
				outOfStockCount,
				bestSellersCount,
				lowStockAlerts,
				inventoryValue,
				totalRevenue,
				categoryDistribution,
				statusDistribution,
				topPerformingProducts,
				latestProducts: latestProducts.map((product) => ({
					id: product.uid,
					name: product.name,
					price: product.price,
					category: product.category,
					stockQuantity: product.stockQuantity,
					status: product.status,
					createdAt: format(new Date(product.createdAt), 'PP'),
				})),
				analytics: productAnalyticsSummary,
				promotions: promotionMetrics,
			};
		} catch (error) {
			this.logger.error(`Error collecting product metrics: ${error.message}`, error.stack);
			return {
				totalProductsCount: 0,
				activeProductsCount: 0,
				newProductsCount: 0,
				outOfStockCount: 0,
				bestSellersCount: 0,
				lowStockAlerts: [],
				inventoryValue: 0,
				totalRevenue: 0,
				categoryDistribution: {},
				statusDistribution: {},
				topPerformingProducts: [],
				latestProducts: [],
				analytics: {
					averageSellPrice: 0,
					averageProfitMargin: 0,
					averageStockTurnover: 0,
					totalUnitsSold: 0,
					returnRate: 0,
					conversionRate: 0,
				},
				promotions: {
					activePromotionsCount: 0,
					averageDiscountPercentage: 0,
					productsOnPromotion: [],
				},
			};
		}
	}

	/**
	 * Get product category distribution
	 */
	private async getProductCategoryDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get all products
			const products = await this.productRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				select: ['category'],
			});

			// Count products by category
			const distribution: Record<string, number> = {};

			products.forEach((product) => {
				const category = product.category || 'Uncategorized';

				if (!distribution[category]) {
					distribution[category] = 0;
				}

				distribution[category]++;
			});

			return distribution;
		} catch (error) {
			this.logger.error(`Error getting product category distribution: ${error.message}`, error.stack);
			return {};
		}
	}

	/**
	 * Get product status distribution
	 */
	private async getProductStatusDistribution(
		organisationId: number,
		branchId?: number,
	): Promise<Record<string, number>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			const result: Record<string, number> = {};

			// Initialize all statuses with 0
			for (const status of Object.values(ProductStatus)) {
				result[status] = 0;
			}

			// Count products by status
			for (const status of Object.values(ProductStatus)) {
				const count = await this.productRepository.count({
					where: {
						...orgFilter,
						...branchFilter,
						status,
						isDeleted: false,
					},
				});

				result[status] = count;
			}

			return result;
		} catch (error) {
			this.logger.error(`Error getting product status distribution: ${error.message}`, error.stack);
			return {};
		}
	}

	/**
	 * Get top performing products by revenue
	 */
	private async getTopPerformingProducts(organisationId: number, branchId?: number): Promise<any[]> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get products with their analytics
			const products = await this.productRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				relations: ['analytics'],
				select: ['uid', 'name', 'price', 'category', 'status'],
			});

			// Sort products by revenue and take top 10
			return products
				.filter((product) => product.analytics?.totalRevenue > 0)
				.map((product) => ({
					id: product.uid,
					name: product.name,
					price: product.price,
					category: product.category,
					status: product.status,
					totalRevenue: product.analytics?.totalRevenue || 0,
					totalUnitsSold: product.analytics?.totalUnitsSold || 0,
					profitMargin: product.analytics?.profitMargin || 0,
				}))
				.sort((a, b) => b.totalRevenue - a.totalRevenue)
				.slice(0, 10);
		} catch (error) {
			this.logger.error(`Error getting top performing products: ${error.message}`, error.stack);
			return [];
		}
	}

	/**
	 * Get summary of product analytics metrics
	 */
	private async getProductAnalyticsSummary(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get product analytics
			const productAnalytics = await this.productAnalyticsRepository.find({
				join: {
					alias: 'analytics',
					innerJoin: {
						product: 'analytics.product',
					},
				},
				where: {
					product: {
						...orgFilter,
						...branchFilter,
						isDeleted: false,
					},
				},
			});

			// Calculate average metrics
			let totalSellPrice = 0;
			let totalProfitMargin = 0;
			let totalStockTurnover = 0;
			let totalUnitsSold = 0;
			let totalReturnRate = 0;
			let totalConversionRate = 0;
			let totalRevenue = 0;

			const analyticsCount = productAnalytics.length;

			productAnalytics.forEach((analytics) => {
				if (analytics.averageSellingPrice) totalSellPrice += analytics.averageSellingPrice;
				if (analytics.profitMargin) totalProfitMargin += analytics.profitMargin;
				if (analytics.stockTurnoverRate) totalStockTurnover += analytics.stockTurnoverRate;
				totalUnitsSold += analytics.totalUnitsSold || 0;
				totalReturnRate += analytics.returnRate || 0;
				totalConversionRate += analytics.conversionRate || 0;
				totalRevenue += analytics.totalRevenue || 0;
			});

			return {
				averageSellPrice: analyticsCount > 0 ? totalSellPrice / analyticsCount : 0,
				averageProfitMargin: analyticsCount > 0 ? totalProfitMargin / analyticsCount : 0,
				averageStockTurnover: analyticsCount > 0 ? totalStockTurnover / analyticsCount : 0,
				totalUnitsSold,
				returnRate: analyticsCount > 0 ? totalReturnRate / analyticsCount : 0,
				conversionRate: analyticsCount > 0 ? totalConversionRate / analyticsCount : 0,
				totalRevenue,
			};
		} catch (error) {
			this.logger.error(`Error getting product analytics summary: ${error.message}`, error.stack);
			return {
				averageSellPrice: 0,
				averageProfitMargin: 0,
				averageStockTurnover: 0,
				totalUnitsSold: 0,
				returnRate: 0,
				conversionRate: 0,
				totalRevenue: 0,
			};
		}
	}

	/**
	 * Calculate total inventory value
	 */
	private async calculateTotalInventoryValue(organisationId: number, branchId?: number): Promise<number> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get all products with stock quantity and price
			const products = await this.productRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				select: ['stockQuantity', 'price'],
			});

			// Calculate total inventory value
			return products.reduce((total, product) => {
				const productValue = product.stockQuantity * (product.price || 0);
				return total + productValue;
			}, 0);
		} catch (error) {
			this.logger.error(`Error calculating inventory value: ${error.message}`, error.stack);
			return 0;
		}
	}

	/**
	 * Get metrics for products on promotion
	 */
	private async getPromotionMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			const now = new Date();

			// Get products currently on promotion
			const productsOnPromotion = await this.productRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isOnPromotion: true,
					isDeleted: false,
					promotionStartDate: LessThanOrEqual(now),
					promotionEndDate: MoreThanOrEqual(now),
				},
				select: ['uid', 'name', 'price', 'salePrice', 'discount', 'promotionEndDate'],
			});

			// Calculate average discount percentage
			let totalDiscountPercentage = 0;

			productsOnPromotion.forEach((product) => {
				if (product.discount) {
					totalDiscountPercentage += product.discount;
				} else if (product.price && product.salePrice) {
					const discountPercent = ((product.price - product.salePrice) / product.price) * 100;
					totalDiscountPercentage += discountPercent;
				}
			});

			const averageDiscountPercentage =
				productsOnPromotion.length > 0 ? totalDiscountPercentage / productsOnPromotion.length : 0;

			return {
				activePromotionsCount: productsOnPromotion.length,
				averageDiscountPercentage,
				productsOnPromotion: productsOnPromotion
					.map((product) => ({
						id: product.uid,
						name: product.name,
						regularPrice: product.price,
						salePrice: product.salePrice,
						discount: product.discount,
						promotionEndsAt: format(new Date(product.promotionEndDate), 'PP'),
					}))
					.slice(0, 5), // Show top 5 promotional products
			};
		} catch (error) {
			this.logger.error(`Error getting promotion metrics: ${error.message}`, error.stack);
			return {
				activePromotionsCount: 0,
				averageDiscountPercentage: 0,
				productsOnPromotion: [],
			};
		}
	}

	// New method to collect claims metrics
	private async collectClaimsMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);
			
			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			
			// Get all claims
			const claims = await this.claimRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
			});
			
			// Claims created today
			const claimsToday = claims.filter(claim => 
				claim.createdAt && new Date(claim.createdAt) >= startOfToday
			);
			
			// Group claims by status
			const statusCounts = {};
			
			// Initialize with all statuses
			Object.values(ClaimStatus).forEach(status => {
				statusCounts[status] = 0;
			});
			
			// Count claims by status
			claims.forEach(claim => {
				if (claim.status) {
					statusCounts[claim.status] = (statusCounts[claim.status] || 0) + 1;
				}
			});
			
			// Group claims by category
			const categoryCounts = {};
			
			// Initialize with all categories
			Object.values(ClaimCategory).forEach(category => {
				categoryCounts[category] = 0;
			});
			
			// Count claims by category
			claims.forEach(claim => {
				if (claim.category) {
					categoryCounts[claim.category] = (categoryCounts[claim.category] || 0) + 1;
				}
			});
			
			// Calculate total claim value
			const totalClaimValue = claims.reduce((total, claim) => {
				const amount = typeof claim.amount === 'string' ? parseFloat(claim.amount) : claim.amount;
				return total + (isNaN(amount) ? 0 : amount);
			}, 0);
			
			// Format the total claim value with currency
			const totalClaimValueFormatted = new Intl.NumberFormat('en-ZA', {
				style: 'currency',
				currency: 'ZAR',
			}).format(totalClaimValue);
			
			// Get top claim creators
			const claimsByUser = new Map();
			
			claims.forEach(claim => {
				if (claim.owner) {
					const userId = claim.owner.uid;
					const currentData = claimsByUser.get(userId) || {
						name: claim.owner.name,
						count: 0,
						value: 0,
					};
					
					currentData.count++;
					const amount = typeof claim.amount === 'string' ? parseFloat(claim.amount) : claim.amount;
					currentData.value += isNaN(amount) ? 0 : amount;
					
					claimsByUser.set(userId, currentData);
				}
			});
			
			const topClaimCreators = Array.from(claimsByUser.entries())
				.map(([userId, data]) => ({
					userId,
					userName: data.name,
					claimCount: data.count,
					totalValue: data.value,
					formattedValue: new Intl.NumberFormat('en-ZA', {
						style: 'currency',
						currency: 'ZAR',
					}).format(data.value),
				}))
				.sort((a, b) => b.claimCount - a.claimCount)
				.slice(0, 5);
			
			return {
				totalClaims: claims.length,
				claimsToday: claimsToday.length,
				pendingClaims: statusCounts[ClaimStatus.PENDING] || 0,
				approvedClaims: statusCounts[ClaimStatus.APPROVED] || 0,
				declinedClaims: statusCounts[ClaimStatus.DECLINED] || 0,
				paidClaims: statusCounts[ClaimStatus.PAID] || 0,
				totalClaimValue,
				totalClaimValueFormatted,
				statusDistribution: statusCounts,
				categoryDistribution: categoryCounts,
				topClaimCreators,
				recentClaims: claims.slice(0, 10).map(claim => ({
					uid: claim.uid,
					amount: claim.amount,
					comments: claim.comments, 
					status: claim.status,
					category: claim.category,
					createdAt: claim.createdAt,
					ownerName: claim.owner?.name,
				})),
			};
		} catch (error) {
			this.logger.error(`Error collecting claims metrics: ${error.message}`, error.stack);
			return {
				totalClaims: 0,
				claimsToday: 0,
				pendingClaims: 0,
				approvedClaims: 0,
				declinedClaims: 0,
				paidClaims: 0,
				totalClaimValue: 0,
				totalClaimValueFormatted: '$0.00',
				statusDistribution: {},
				categoryDistribution: {},
				topClaimCreators: [],
				recentClaims: [],
			};
		}
	}

	// New method to collect journal metrics
	private async collectJournalMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);
			
			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			
			// Get all journals
			const journals = await this.journalRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
			});
			
			// Journals created today
			const journalsToday = journals.filter(journal => 
				journal.createdAt && new Date(journal.createdAt) >= startOfToday
			);
			
			// Group journals by status
			const statusCounts = {};
			
			// Count journal by status
			journals.forEach(journal => {
				if (journal.status) {
					statusCounts[journal.status] = (statusCounts[journal.status] || 0) + 1;
				}
			});
			
			// Calculate recent journals activity
			const last30DaysJournals = journals.filter(
				journal => journal.createdAt && new Date(journal.createdAt) >= subDays(today, 30)
			);
			
			// Group by days
			const journalsByDay = {};
			
			last30DaysJournals.forEach(journal => {
				if (journal.createdAt) {
					const day = format(new Date(journal.createdAt), 'yyyy-MM-dd');
					journalsByDay[day] = (journalsByDay[day] || 0) + 1;
				}
			});
			
			// Get top journal creators
			const journalsByUser = new Map();
			
			journals.forEach(journal => {
				if (journal.owner) {
					const userId = journal.owner.uid;
					const currentData = journalsByUser.get(userId) || {
						name: journal.owner.name,
						count: 0,
					};
					
					currentData.count++;
					journalsByUser.set(userId, currentData);
				}
			});
			
			const topJournalCreators = Array.from(journalsByUser.entries())
				.map(([userId, data]) => ({
					userId,
					userName: data.name,
					journalCount: data.count,
				}))
				.sort((a, b) => b.journalCount - a.journalCount)
				.slice(0, 5);
			
			return {
				totalJournals: journals.length,
				journalsToday: journalsToday.length,
				statusDistribution: statusCounts,
				dailyActivity: journalsByDay,
				topCreators: topJournalCreators,
				recentJournals: journals.slice(0, 10).map(journal => ({
					uid: journal.uid,
					clientRef: journal.clientRef,
					comments: journal.comments ? (journal.comments.length > 100 ? 
						journal.comments.substring(0, 100) + '...' : journal.comments) : '',
					status: journal.status,
					createdAt: journal.createdAt,
					ownerName: journal.owner?.name,
				})),
			};
		} catch (error) {
			this.logger.error(`Error collecting journal metrics: ${error.message}`, error.stack);
			return {
				totalJournals: 0,
				journalsToday: 0,
				statusDistribution: {},
				dailyActivity: {},
				topCreators: [],
				recentJournals: [],
			};
		}
	}
	
	// New method to collect task flag metrics
	private async collectTaskFlagMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);
			
			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};
			
			// Get tasks for this organization/branch
			const tasks = await this.taskRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					isDeleted: false,
				},
				relations: ['flags', 'flags.createdBy', 'flags.items'],
			});
			
			// Extract all flags from tasks
			const allFlags = tasks.reduce((flags, task) => {
				if (task.flags && task.flags.length > 0) {
					return [...flags, ...task.flags];
				}
				return flags;
			}, []);
			
			// Flags created today
			const flagsToday = allFlags.filter(flag => 
				flag.createdAt && new Date(flag.createdAt) >= startOfToday
			);
			
			// Group flags by status
			const statusCounts = {};
			
			// Initialize with all statuses
			Object.values(TaskFlagStatus).forEach(status => {
				statusCounts[status] = 0;
			});
			
			// Count flags by status
			allFlags.forEach(flag => {
				if (flag.status) {
					statusCounts[flag.status] = (statusCounts[flag.status] || 0) + 1;
				}
			});
			
			// Calculate resolution times for resolved flags
			const resolvedFlags = allFlags.filter(flag => 
				flag.status === TaskFlagStatus.RESOLVED || flag.status === TaskFlagStatus.CLOSED
			);
			
			let totalResolutionMinutes = 0;
			let resolutionTimeCount = 0;
			
			resolvedFlags.forEach(flag => {
				if (flag.createdAt && flag.updatedAt) {
					const resolutionMinutes = differenceInMinutes(
						new Date(flag.updatedAt),
						new Date(flag.createdAt)
					);
					
					if (resolutionMinutes > 0) {
						totalResolutionMinutes += resolutionMinutes;
						resolutionTimeCount++;
					}
				}
			});
			
			// Calculate average resolution time in hours
			const averageResolutionHours = resolutionTimeCount > 0 ? 
				Math.round((totalResolutionMinutes / resolutionTimeCount) / 60 * 10) / 10 : 0;
			
			// Find tasks with most flags
			const taskFlagCounts = new Map();
			
			tasks.forEach(task => {
				if (task.flags && task.flags.length > 0) {
					taskFlagCounts.set(task.uid, {
						taskId: task.uid,
						taskTitle: task.title,
						flagCount: task.flags.length,
						openFlagCount: task.flags.filter(f => 
							f.status === TaskFlagStatus.OPEN || f.status === TaskFlagStatus.IN_PROGRESS
						).length,
					});
				}
			});
			
			const mostFlaggedTasks = Array.from(taskFlagCounts.values())
				.sort((a, b) => b.flagCount - a.flagCount)
				.slice(0, 5);
			
			// Get top flag creators
			const flagsByUser = new Map();
			
			allFlags.forEach(flag => {
				if (flag.createdBy) {
					const userId = flag.createdBy.uid;
					const currentData = flagsByUser.get(userId) || {
						name: flag.createdBy.name,
						count: 0,
						resolvedCount: 0,
					};
					
					currentData.count++;
					
					if (flag.status === TaskFlagStatus.RESOLVED || flag.status === TaskFlagStatus.CLOSED) {
						currentData.resolvedCount++;
					}
					
					flagsByUser.set(userId, currentData);
				}
			});
			
			const topFlagCreators = Array.from(flagsByUser.entries())
				.map(([userId, data]) => ({
					userId,
					userName: data.name,
					flagCount: data.count,
					resolvedCount: data.resolvedCount,
					resolutionRate: data.count > 0 ? Math.round((data.resolvedCount / data.count) * 100) : 0,
				}))
				.sort((a, b) => b.flagCount - a.flagCount)
				.slice(0, 5);
			
			return {
				totalFlags: allFlags.length,
				flagsToday: flagsToday.length,
				openFlags: statusCounts[TaskFlagStatus.OPEN] || 0,
				inProgressFlags: statusCounts[TaskFlagStatus.IN_PROGRESS] || 0,
				resolvedFlags: statusCounts[TaskFlagStatus.RESOLVED] || 0,
				closedFlags: statusCounts[TaskFlagStatus.CLOSED] || 0,
				averageResolutionHours,
				statusDistribution: statusCounts,
				mostFlaggedTasks,
				topFlagCreators,
				recentFlags: allFlags
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
					.slice(0, 10)
					.map(flag => ({
						uid: flag.uid,
						title: flag.title,
						description: flag.description ? (flag.description.length > 100 ? 
							flag.description.substring(0, 100) + '...' : flag.description) : '',
						status: flag.status,
						createdAt: flag.createdAt,
						creatorName: flag.createdBy?.name,
						taskId: flag.task?.uid,
						taskTitle: flag.task?.title,
					})),
			};
		} catch (error) {
			this.logger.error(`Error collecting task flag metrics: ${error.message}`, error.stack);
			return {
				totalFlags: 0,
				flagsToday: 0,
				openFlags: 0,
				inProgressFlags: 0,
				resolvedFlags: 0,
				closedFlags: 0,
				averageResolutionHours: 0,
				statusDistribution: {},
				mostFlaggedTasks: [],
				topFlagCreators: [],
				recentFlags: [],
			};
		}
	}

	/**
	 * Collect summary metrics from CheckIn entities
	 */
	private async collectCheckInSummaryMetrics(organisationId: number, branchId?: number): Promise<Record<string, any>> {
		try {
			const today = new Date();
			const startOfToday = startOfDay(today);

			// Create base filters
			const orgFilter = { organisation: { uid: organisationId } };
			const branchFilter = branchId ? { branch: { uid: branchId } } : {};

			// Get all check-ins for today
			const checkIns = await this.checkInRepository.find({
				where: {
					...orgFilter,
					...branchFilter,
					checkInTime: MoreThanOrEqual(startOfToday),
				},
				relations: ['client'], // Include client to identify check-in type
			});

			const totalCheckInsToday = checkIns.length;
			const clientCheckInsToday = checkIns.filter(ci => ci.client).length;
			const staffCheckInsToday = totalCheckInsToday - clientCheckInsToday; // Assuming non-client check-ins are staff

			// Count check-ins by purpose (if the field exists and is used)
			const checkInsByPurpose: Record<string, number> = {};
			checkIns.forEach(checkIn => {
				const purpose = (checkIn as any).purpose || 'Unknown'; // Assuming 'purpose' exists
				checkInsByPurpose[purpose] = (checkInsByPurpose[purpose] || 0) + 1;
			});

			// Placeholder for average duration - requires check-out time logic which might not be standard for CheckIn entity
			const averageCheckInDurationMinutes = 0;

			return {
				totalCheckInsToday,
				clientCheckInsToday,
				staffCheckInsToday,
				checkInsByPurpose,
				averageCheckInDurationMinutes,
			};

		} catch (error) {
			this.logger.error(`Error collecting check-in summary metrics: ${error.message}`, error.stack);
			return {
				totalCheckInsToday: 0,
				clientCheckInsToday: 0,
				staffCheckInsToday: 0,
				checkInsByPurpose: {},
				averageCheckInDurationMinutes: 0,
			};
		}
	}

	/**
	 * Fetches license information for the given organization
	 */
	private async getLicenseInformation(organisationId: number): Promise<Record<string, any> | null> {
		try {
			const license = await this.licenseRepository.findOne({
				where: { organisation: { uid: organisationId } },
			});

			if (!license) {
				this.logger.warn(`No license found for organisation ${organisationId}`);
				return null; // Or return default/trial license info
			}

			return {
				licenseKey: license.licenseKey,
				type: license.type,
				plan: license.plan,
				status: license.status,
				billingCycle: license.billingCycle,
				validUntil: license.validUntil.toISOString(),
				lastValidated: license.lastValidated?.toISOString(),
				maxUsers: license.maxUsers,
				maxBranches: license.maxBranches,
				storageLimitMB: license.storageLimit,
				apiCallLimit: license.apiCallLimit,
				integrationLimit: license.integrationLimit,
				price: license.price,
				hasPendingPayments: license.hasPendingPayments,
				features: license.features,
			};

		} catch (error) {
			this.logger.error(`Error fetching license information for organisation ${organisationId}: ${error.message}`, error.stack);
			return null; // Return null on error
		}
	}
}
