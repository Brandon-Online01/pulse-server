import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { Task } from '../tasks/entities/task.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Journal } from '../journal/entities/journal.entity';
import { User } from '../user/entities/user.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Report } from './entities/report.entity';
import { ReportType, ReportStatus, ReportMetricType, ReportTimeframe, ReportFormat } from '../lib/enums/report.enums';
import { TaskStatus, TaskPriority } from '../lib/enums/task.enums';
import { LeadStatus } from '../lib/enums/lead.enums';
import { Department } from '../lib/enums/user.enums';
import {
	ReportGenerationOptions,
	TaskMetrics,
	AttendanceMetrics,
	ClientVisitMetrics,
	QuotationMetrics,
	RewardMetrics,
	JournalMetrics,
	ProductivityMetrics,
	DailyUserActivityReport,
	DashboardAnalyticsReport,
	DepartmentMetrics,
	LiveUserReport,
} from './report.types';
import { Achievement } from '../rewards/entities/achievement.entity';
import { Client } from '../clients/entities/client.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';
import { CommunicationService } from '../communication/communication.service';
import { EmailType } from '../lib/enums/email.enums';
import { Tracking } from 'src/tracking/entities/tracking.entity';
import { LiveUserReportService } from './live-user-report.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class ReportsService {
	private readonly currencyLocale: string;
	private readonly currencyCode: string;
	private readonly currencySymbol: string;
	private readonly WORK_HOURS_PER_DAY = 8;
	private readonly MINUTES_PER_HOUR = 60;
	private readonly BRANCH_CACHE_PREFIX = 'branch';
	private readonly CACHE_TTL = 3600; // 1 hour in seconds

	constructor(
		private readonly configService: ConfigService,
		private readonly eventEmitter: EventEmitter2,
		private readonly communicationService: CommunicationService,
		@InjectRepository(CheckIn)
		private readonly checkInRepository: Repository<CheckIn>,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(Claim)
		private readonly claimRepository: Repository<Claim>,
		@InjectRepository(Lead)
		private readonly leadRepository: Repository<Lead>,
		@InjectRepository(Journal)
		private readonly journalRepository: Repository<Journal>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Attendance)
		private readonly attendanceRepository: Repository<Attendance>,
		@InjectRepository(Achievement)
		private readonly achievementRepository: Repository<Achievement>,
		@InjectRepository(Report)
		private readonly reportRepository: Repository<Report>,
		@InjectRepository(Organisation)
		private readonly organisationRepository: Repository<Organisation>,
		@InjectRepository(Branch)
		private readonly branchRepository: Repository<Branch>,
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>,
		@InjectRepository(Tracking)
		private readonly trackingRepository: Repository<Tracking>,
		private readonly liveUserReportService: LiveUserReportService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
	}

	private getBranchCacheKey(branchUid: number): string {
		return `${this.BRANCH_CACHE_PREFIX}:uid:${branchUid}`;
	}

	private async getCachedBranch(branchUid: number): Promise<Branch | null> {
		return this.cacheManager.get<Branch>(this.getBranchCacheKey(branchUid));
	}

	private async cacheBranch(branch: Branch): Promise<void> {
		await this.cacheManager.set(this.getBranchCacheKey(branch.uid), branch, this.CACHE_TTL);
	}

	async generateReport(options: ReportGenerationOptions): Promise<Report> {
		const report = new Report();
		report.type = options.type;
		report.format = options.format;
		report.timeframe = options.timeframe;
		report.startDate = options.startDate;
		report.endDate = options.endDate;
		report.filters = options.filters;
		report.status = ReportStatus.GENERATING;
		report.createdAt = new Date();

		if (options.userId) {
			const user = await this.userRepository.findOne({
				where: { uid: options.userId },
			});
			if (!user) throw new NotFoundException('User not found');
			report.owner = user;
			report.ownerUid = user.uid;
		}

		if (options.organisationRef) {
			const organisation = await this.organisationRepository.findOne({
				where: { ref: options.organisationRef },
			});
			if (!organisation) throw new NotFoundException('Organisation not found');
			report.organisation = organisation;
			report.organisationRef = organisation.ref;
		}

		if (options.branchUid) {
			// Try to get branch from cache first
			let branch = await this.getCachedBranch(options.branchUid);
			
			// If not in cache, fetch from database
			if (!branch) {
				branch = await this.branchRepository.findOne({
					where: { uid: options.branchUid },
				});
				
				// Store in cache if found
				if (branch) {
					await this.cacheBranch(branch);
				}
			}
			
			if (!branch) throw new NotFoundException('Branch not found');
			report.branch = branch;
			report.branchUid = branch.uid;
		}

		try {
			let data: DailyUserActivityReport | DashboardAnalyticsReport;

			if (options.type === ReportType.DAILY_USER) {
				data = await this.generateDailyUserReport(options);
			} else {
				data = await this.generateDashboardReport(options);
			}

			report.data = data;
			report.status = ReportStatus.COMPLETED;
			report.completedAt = new Date();

			// Calculate metrics based on the report data
			report.metrics = this.calculateReportMetrics(data);

			// Generate report summary
			report.summary = this.generateReportSummary(data);

			// Add metadata
			report.metadata = {
				generatedBy: options.userId?.toString(),
				generationTime: report?.createdAt ? Date.now() - report?.createdAt?.getTime() : 0,
				dataPoints: this.countDataPoints(data),
				version: '2.0',
				source: 'system',
			};

			const savedReport = await this.reportRepository.save(report);

			// Send email if it's a daily user report
			if (options.type === ReportType.DAILY_USER && report.owner) {
				await this.sendDailyReportEmail(report.owner, data as DailyUserActivityReport);
			}

			console.log('Report generated successfully', report);

			return savedReport;
		} catch (error) {
			report.status = ReportStatus.FAILED;
			report.errorMessage = error.message;
			await this.reportRepository.save(report);
			throw error;
		}
	}

	@OnEvent('daily-report')
	async handleDailyReport(payload: ReportGenerationOptions) {
		try {
			await this.generateReport(payload);
		} catch (error) {
			console.error('Failed to generate daily report:', error);
			// Optionally emit a failure event that can be handled by the system
			this.eventEmitter.emit('daily-report-failed', {
				userId: payload.userId,
				error: error.message,
			});
		}
	}

	async generateDailyUserReport(options: ReportGenerationOptions): Promise<DailyUserActivityReport> {
		try {
			if (!options.userId) {
				throw new Error('User ID is required for daily report');
			}

			const dateRange = {
				start: options.startDate,
				end: options.endDate,
			};

			// Fetch all required data in parallel with error handling
			const [
				attendanceRecords,
				tasks,
				clientVisits,
				leads,
				achievements,
				journals,
				userRewards,
				user,
			] = await Promise.all([
				this.fetchAttendanceRecords(options.userId, dateRange),
				this.fetchTasks(options.userId, dateRange),
				this.fetchClientVisits(options.userId, dateRange),
				this.fetchLeads(options.userId, dateRange),
				this.fetchAchievements(options.userId, dateRange),
				this.fetchJournals(options.userId, dateRange),
				this.fetchUserRewards(options.userId),
				this.userRepository.findOne({ where: { uid: options.userId } }),
			]).catch((error) => {
				throw new Error(`Failed to fetch report data: ${error.message}`);
			});

			if (!user) {
				throw new NotFoundException(`User with ID ${options.userId} not found`);
			}

			// Calculate metrics with performance optimizations
			const [
				attendance,
				clientVisitMetrics,
				taskMetrics,
				quotationMetrics,
				rewardMetrics,
				journalMetrics,
			] = await Promise.all([
				this.calculateAttendanceMetrics(attendanceRecords),
				this.calculateClientVisitMetrics(clientVisits),
				this.calculateTaskMetrics(tasks),
				this.calculateQuotationMetrics(leads),
				this.calculateRewardMetrics([...achievements, ...userRewards]),
				this.calculateJournalMetrics(journals),
			]);

			// Calculate productivity score after all metrics are available
			const productivity = this.calculateProductivityMetrics({
				tasks: taskMetrics,
				attendance,
				clientVisits: clientVisitMetrics,
				quotations: quotationMetrics,
			});

			const report: DailyUserActivityReport = {
				userId: options.userId,
				date: options.startDate,
				attendance,
				clientVisits: clientVisitMetrics,
				tasks: taskMetrics,
				quotations: quotationMetrics,
				rewards: rewardMetrics,
				journals: journalMetrics,
				productivity,
				summary: this.generateDailyReportSummary({
					attendance,
					tasks: taskMetrics,
					clientVisits: clientVisitMetrics,
					quotations: quotationMetrics,
					productivity,
				}),
			};

			return report;
		} catch (error) {
			throw new Error(`Failed to generate daily report: ${error.message}`);
		}
	}

	private async fetchAttendanceRecords(userId: number, dateRange: { start: Date; end: Date }): Promise<Attendance[]> {
		return this.attendanceRepository.find({
			where: {
				owner: { uid: userId },
				checkIn: Between(dateRange.start, dateRange.end),
			},
			order: { checkIn: 'ASC' },
		});
	}

	private async fetchTasks(userId: number, dateRange: { start: Date; end: Date }): Promise<Task[]> {
		return this.taskRepository.find({
			where: {
				creator: { uid: userId },
				createdAt: Between(dateRange.start, dateRange.end),
			},
			order: { createdAt: 'ASC' },
		});
	}

	private async fetchClientVisits(userId: number, dateRange: { start: Date; end: Date }): Promise<CheckIn[]> {
		return this.checkInRepository.find({
			where: {
				owner: { uid: userId },
				checkInTime: Between(dateRange.start, dateRange.end),
			},
			relations: ['client'],
			order: { checkInTime: 'ASC' },
		});
	}

	private async fetchLeads(userId: number, dateRange: { start: Date; end: Date }): Promise<Lead[]> {
		return this.leadRepository.find({
			where: {
				owner: { uid: userId },
				createdAt: Between(dateRange.start, dateRange.end),
			},
			order: { createdAt: 'ASC' },
		});
	}

	private async fetchAchievements(userId: number, dateRange: { start: Date; end: Date }): Promise<Achievement[]> {
		return this.achievementRepository.find({
			where: {
				userRewards: { owner: { uid: userId } },
				createdAt: Between(dateRange.start, dateRange.end),
			},
			order: { createdAt: 'ASC' },
		});
	}

	private async fetchJournals(userId: number, dateRange: { start: Date; end: Date }): Promise<Journal[]> {
		return this.journalRepository.find({
			where: {
				owner: { uid: userId },
				createdAt: Between(dateRange.start, dateRange.end),
			},
			order: { createdAt: 'ASC' },
		});
	}

	private async fetchUserRewards(userId: number): Promise<Achievement[]> {
		return this.achievementRepository
			.createQueryBuilder('achievement')
			.innerJoin('achievement.userRewards', 'userReward')
			.innerJoin('userReward.owner', 'user')
			.where('user.uid = :userId', { userId })
			.orderBy('achievement.createdAt', 'ASC')
			.getMany();
	}

	private calculateAttendanceMetrics(records: Attendance[]): AttendanceMetrics {
		try {
			const totalDays = records?.length || 0;
			const presentDays = records?.filter((r) => r?.checkOut)?.length || 0;
			const lateCheckIns = records?.filter((r) => this.isLateCheckIn(r?.checkIn))?.length || 0;

			let totalHours = 0;
			let totalOvertime = 0;
			let totalBreakTime = 0;

			records?.forEach((record) => {
				if (record?.checkOut) {
					const duration = record.checkOut.getTime() - record?.checkIn?.getTime();
					const hours = duration / (1000 * 60 * 60);
					totalHours += hours;
					
					if (hours > this.WORK_HOURS_PER_DAY) {
						totalOvertime += hours - this.WORK_HOURS_PER_DAY;
					}

					// Calculate break time (if available in the record)
					if (record.breakStartTime && record.breakEndTime) {
						const breakDuration = record.breakEndTime.getTime() - record.breakStartTime.getTime();
						totalBreakTime += breakDuration / (1000 * 60);
					}
				}
			});

			const averageHoursWorked = presentDays ? totalHours / presentDays : 0;
			const averageBreakTime = presentDays ? totalBreakTime / presentDays : 0;

			return {
				totalDays,
				presentDays,
				absentDays: totalDays - presentDays,
				attendanceRate: totalDays ? (presentDays / totalDays) * 100 : 0,
				averageCheckInTime: this.calculateAverageTime(records?.map((r) => r?.checkIn) || []),
				averageCheckOutTime: this.calculateAverageTime(records?.filter((r) => r?.checkOut)?.map((r) => r?.checkOut) || []),
				averageHoursWorked,
				totalOvertime,
				onTimeCheckIns: totalDays - lateCheckIns,
				lateCheckIns,
				averageBreakTime,
				efficiency: this.calculateWorkEfficiency(averageHoursWorked, averageBreakTime),
			};
		} catch (error) {
			console.error('Error calculating attendance metrics:', error);
			return this.getDefaultAttendanceMetrics();
		}
	}

	private calculateWorkEfficiency(averageHoursWorked: number, averageBreakTime: number): number {
		const totalWorkMinutes = averageHoursWorked * this.MINUTES_PER_HOUR;
		const expectedWorkMinutes = this.WORK_HOURS_PER_DAY * this.MINUTES_PER_HOUR;
		const efficiency = ((totalWorkMinutes - averageBreakTime) / expectedWorkMinutes) * 100;
		return Math.min(Math.max(efficiency, 0), 100); // Clamp between 0 and 100
	}

	private getDefaultAttendanceMetrics(): AttendanceMetrics {
		return {
			totalDays: 0,
			presentDays: 0,
			absentDays: 0,
			attendanceRate: 0,
			averageCheckInTime: '00:00',
			averageCheckOutTime: '00:00',
			averageHoursWorked: 0,
			totalOvertime: 0,
			onTimeCheckIns: 0,
			lateCheckIns: 0,
			averageBreakTime: 0,
			efficiency: 0,
		};
	}

	private calculateClientVisitMetrics(visits: CheckIn[]): ClientVisitMetrics {
		const uniqueClients = new Set(visits?.map((v) => v?.client?.uid))?.size || 0;
		const totalDuration = visits?.reduce((sum, v) => sum + (Number(v?.duration) || 0), 0) || 0;

		return {
			totalVisits: visits?.length || 0,
			uniqueClients,
			averageTimePerVisit: visits?.length ? totalDuration / visits.length : 0,
			totalDuration,
			byPurpose: this.groupBy(visits || [], 'checkInLocation'),
			conversionRate: 0,
		};
	}

	private calculateTaskMetrics(tasks: Task[]): TaskMetrics {
		const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
		const total = tasks.length;

		return {
			total,
			completed,
			inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
			pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
			overdue: tasks.filter((t) => t.isOverdue).length,
			completionRate: (completed / total) * 100,
			averageCompletionTime: this.calculateAverageCompletionTime(tasks),
			byPriority: {
				high: tasks.filter((t) => t.priority === TaskPriority.HIGH).length,
				medium: tasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
				low: tasks.filter((t) => t.priority === TaskPriority.LOW).length,
			},
			byType: this.groupBy(tasks, 'taskType'),
		};
	}

	private calculateQuotationMetrics(leads: Lead[]): QuotationMetrics {
		const approved = leads?.filter((q) => q?.status === LeadStatus.APPROVED) || [];
		const total = leads?.length || 0;
		const totalValue = leads?.reduce((sum, lead) => {
			const leadValue = (lead as any)?.value || (lead as any)?.amount || (lead as any)?.quotationValue || 0;
			return sum + leadValue;
		}, 0) || 0;

		return {
			total,
			approved: approved?.length || 0,
			rejected: leads?.filter((q) => q?.status === LeadStatus.DECLINED)?.length || 0,
			pending: leads?.filter((q) => q?.status === LeadStatus.PENDING)?.length || 0,
			conversionRate: total > 0 ? ((approved?.length || 0) / total) * 100 : 0,
			averageValue: approved?.length > 0 ? totalValue / approved.length : 0,
			totalValue,
			byProduct: this.groupBy(leads || [], 'name'),
		};
	}

	private calculateRewardMetrics(achievements: Achievement[]): RewardMetrics {
		return {
			totalXP: achievements.reduce((sum, r) => sum + (r.xpValue || 0), 0),
			totalRewards: achievements.length,
			byCategory: this.groupBy(achievements, 'category'),
			achievements: achievements.map((r) => ({
				name: r.name,
				earnedAt: r.createdAt,
				xpValue: r.xpValue,
			})),
		};
	}

	private calculateJournalMetrics(journals: Journal[]): JournalMetrics {
		const byCategory = this.groupBy(journals || [], 'type' as keyof Journal);
		const sortedCategories = Object.entries(byCategory)
			?.sort(([, a], [, b]) => b - a)
			?.slice(0, 5)
			?.map(([category]) => category) || [];

		return {
			total: journals?.length || 0,
			byCategory,
			averageEntriesPerDay:
				journals?.length ? 
				journals.length / this.getDaysBetween(journals[0]?.createdAt, journals[journals.length - 1]?.createdAt) : 
				0,
			topCategories: sortedCategories,
		};
	}

	private calculateProductivityMetrics(data: {
		tasks: TaskMetrics;
		attendance: AttendanceMetrics;
		clientVisits?: ClientVisitMetrics;
		quotations?: QuotationMetrics;
	}): ProductivityMetrics {
		const taskEfficiency = (data.tasks.completed / data.tasks.total) * 100;
		const clientHandling = data.clientVisits
			? (data.clientVisits.conversionRate + (data.quotations?.conversionRate || 0)) / 2
			: 0;

		const responseTime = this.calculateAverageResponseTime(data);
		const qualityScore = this.calculateQualityScore(data);

		return {
			score: (taskEfficiency + clientHandling + qualityScore) / 3,
			taskEfficiency,
			clientHandling,
			responseTime,
			qualityScore,
		};
	}

	// Helper methods
	private isLateCheckIn(time: Date): boolean {
		const hour = time.getHours();
		const minutes = time.getMinutes();
		return hour > 9 || (hour === 9 && minutes > 0);
	}

	private calculateAverageTime(times: Date[]): string {
		if (!times.length) return '00:00';
		const avgMinutes =
			times.reduce((sum, time) => {
				return sum + time.getHours() * 60 + time.getMinutes();
			}, 0) / times.length;

		const hours = Math.floor(avgMinutes / 60);
		const minutes = Math.floor(avgMinutes % 60);
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

	private calculateAverageCompletionTime(tasks: Task[]): number {
		const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED && t.completionDate);
		if (!completedTasks.length) return 0;

		return (
			completedTasks.reduce((sum, task) => {
				const duration = task.completionDate.getTime() - task.createdAt.getTime();
				return sum + duration;
			}, 0) /
			completedTasks.length /
			(1000 * 60 * 60)
		); // Convert to hours
	}

	private groupBy<T>(items: T[], key: keyof T): Record<string, number> {
		return items?.reduce((acc, item) => {
			const value = String(item?.[key]);
			acc[value] = (acc[value] || 0) + 1;
			return acc;
		}, {} as Record<string, number>) || {};
	}

	private getDaysBetween(start?: Date, end?: Date): number {
		if (!start || !end) return 1;
		return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	}

	private calculateAverageResponseTime(data: any): number {
		// Implementation depends on your specific requirements
		return 0;
	}

	private calculateQualityScore(data: any): number {
		// Implementation depends on your specific requirements
		return 0;
	}

	private countDataPoints(data: any): number {
		return Object.keys(data).length;
	}

	private generateReportSummary(data: any): string {
		// Implementation depends on your specific requirements
		return '';
	}

	private generateDailyReportSummary(data: any): string {
		// Implementation depends on your specific requirements
		return '';
	}

	private generateDashboardSummary(data: any): string {
		// Implementation depends on your specific requirements
		return '';
	}

	private calculateReportMetrics(data: any): any {
		// Implementation depends on your specific requirements
		return {};
	}

	private async getTopPerformers(
		users: User[],
		dateRange: { start: Date; end: Date },
	): Promise<Array<{ userId: number; name: string; score: number }>> {
		const performanceScores = await Promise.all(
			users.map(async (user) => {
				const tasks = await this.taskRepository.find({
					where: {
						creator: { uid: user.uid },
						createdAt: Between(dateRange.start, dateRange.end),
					},
				});

				const attendance = await this.attendanceRepository.find({
					where: {
						owner: { uid: user.uid },
						checkIn: Between(dateRange.start, dateRange.end),
					},
				});

				const taskMetrics = this.calculateTaskMetrics(tasks);
				const attendanceMetrics = this.calculateAttendanceMetrics(attendance);
				const productivity = this.calculateProductivityMetrics({
					tasks: taskMetrics,
					attendance: attendanceMetrics,
				});

				return {
					userId: user.uid,
					name: `${user.name} ${user.surname}`,
					score: productivity.score,
				};
			}),
		);

		return performanceScores.sort((a, b) => b.score - a.score).slice(0, 5);
	}

	private async calculateOrganisationOverview(
		organisation: Organisation,
		dateRange: { start: Date; end: Date },
	): Promise<{
		totalUsers: number;
		activeUsers: number;
		totalTasks: number;
		totalClients: number;
		totalQuotations: number;
		totalRevenue: number;
	}> {
		const [tasks, clients, leads] = await Promise.all([
			this.taskRepository.count({
				where: {
					organisation: { ref: organisation.ref },
					createdAt: Between(dateRange.start, dateRange.end),
				},
			}),
			this.clientRepository.count({
				where: {
					organisation: { ref: organisation.ref },
					createdAt: Between(dateRange.start, dateRange.end),
				},
			}),

			this.leadRepository.count({
				where: {
					createdAt: Between(dateRange.start, dateRange.end),
					status: LeadStatus.CONVERTED,
				},
			}),
		]);

		const activeUsers = await this.userRepository.count({
			where: {
				organisationRef: organisation.ref,
				status: 'active',
			},
		});

		return {
			totalUsers: organisation.users.length,
			activeUsers,
			totalTasks: tasks,
			totalClients: clients,
			totalQuotations: leads,
			totalRevenue: 0, // This would need to be calculated from actual revenue data
		};
	}

	private async calculateOrganisationTrends(
		organisation: Organisation,
		dateRange: { start: Date; end: Date },
	): Promise<{
		taskCompletion: number[];
		clientVisits: number[];
		quotationConversion: number[];
		revenue: number[];
		productivity: number[];
	}> {
		// This would need to be implemented based on your specific requirements for trend calculation
		return {
			taskCompletion: [],
			clientVisits: [],
			quotationConversion: [],
			revenue: [],
			productivity: [],
		};
	}

	private async calculateTopMetrics(
		organisation: Organisation,
		dateRange: { start: Date; end: Date },
	): Promise<{
		performers: Array<{
			userId: number;
			name: string;
			score: number;
			metrics: Record<ReportMetricType, number>;
		}>;
		departments: Array<{
			name: string;
			score: number;
			metrics: Record<ReportMetricType, number>;
		}>;
		products: Array<{
			name: string;
			quotations: number;
			revenue: number;
			growth: number;
		}>;
	}> {
		// This would need to be implemented based on your specific requirements for top metrics
		return {
			performers: [],
			departments: [],
			products: [],
		};
	}

	private async sendDailyReportEmail(user: User, reportData: DailyUserActivityReport): Promise<void> {
		const dailyReportData = {
			name: `${user.name} ${user.surname}`,
			date: reportData.date.toISOString().split('T')[0],
			metrics: {
				xp: {
					level: reportData.rewards.totalXP > 0 ? Math.floor(reportData.rewards.totalXP / 100) : 0,
					currentXP: reportData.rewards.totalXP,
					todayXP: reportData.rewards.achievements.reduce((sum, a) => sum + (a.xpValue || 0), 0),
				},
				attendance: {
					status: reportData.attendance.presentDays > 0 ? 'Present' : 'Absent',
					startTime: reportData.attendance.averageCheckInTime,
					endTime: reportData.attendance.averageCheckOutTime,
					totalHours: reportData.attendance.averageHoursWorked,
					duration: `${Math.floor(reportData.attendance.averageHoursWorked)}h ${Math.round((reportData.attendance.averageHoursWorked % 1) * 60)}m`,
				},
				totalQuotations: reportData.quotations.total,
				totalRevenue: this.formatCurrency(reportData.quotations.totalValue),
				newCustomers: reportData.clientVisits.uniqueClients,
				quotationGrowth: '0%', // This would need historical data to calculate
				revenueGrowth: '0%', // This would need historical data to calculate
				customerGrowth: '0%', // This would need historical data to calculate
				userSpecific: {
					todayLeads: reportData.quotations.total,
					todayClaims: 0, // This would need to be added to the report data
					todayTasks: reportData.tasks.total,
					todayQuotations: reportData.quotations.approved,
					hoursWorked: reportData.attendance.averageHoursWorked,
				},
			},
			tracking: {
				totalDistance: '0 km', // This would need location data to calculate
				locations: reportData.clientVisits.byPurpose ? 
					Object.entries(reportData.clientVisits.byPurpose).map(([address, timeSpent]) => ({
						address,
						timeSpent: `${timeSpent} visits`,
					})) : [],
				averageTimePerLocation: `${Math.round(reportData.clientVisits.averageTimePerVisit)} minutes`,
			},
		};

		await this.communicationService.sendEmail(
			EmailType.DAILY_REPORT,
			[user.email],
			dailyReportData
		);
	}

	private formatCurrency(amount: number): string {
		return new Intl.NumberFormat(this.currencyLocale, {
			style: 'currency',
			currency: this.currencyCode,
		}).format(amount);
	}

	private async generateDashboardReport(options: ReportGenerationOptions): Promise<DashboardAnalyticsReport> {
		if (!options.organisationRef) {
			throw new Error('Organisation reference is required for dashboard report');
		}

		const dateRange = {
			start: options.startDate,
			end: options.endDate,
		};

		const organisation = await this.organisationRepository.findOne({
			where: { ref: options.organisationRef },
			relations: ['users'],
		});

		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}

		const overview = await this.calculateOrganisationOverview(organisation, dateRange);
		const trends = await this.calculateOrganisationTrends(organisation, dateRange);
		const topMetrics = await this.calculateTopMetrics(organisation, dateRange);
		const departments = await this.calculateDepartmentMetrics(organisation, dateRange);

		return {
			timeframe: options.timeframe,
			startDate: dateRange.start,
			endDate: dateRange.end,
			organisationRef: options.organisationRef,
			branchUid: options.branchUid,
			overview,
			departments,
			trends,
			topMetrics,
			summary: this.generateDashboardSummary({
				overview,
				departments,
				trends,
				topMetrics,
			}),
		};
	}

	private async calculateDepartmentMetrics(organisation: Organisation, dateRange: { start: Date; end: Date }): Promise<DepartmentMetrics[]> {
		const departmentIds = [...new Set(organisation.users.map((u) => u.departmentId))];
		return Promise.all(
			departmentIds.map(async (deptId) => {
				const users = await this.userRepository.find({
					where: { departmentId: deptId },
				});

				const departmentTasks = await this.taskRepository.find({
					where: {
						creator: { uid: In(users.map((u) => u.uid)) },
						createdAt: Between(dateRange.start, dateRange.end),
					},
				});

				const departmentAttendance = await this.attendanceRepository.find({
					where: {
						owner: { uid: In(users.map((u) => u.uid)) },
						checkIn: Between(dateRange.start, dateRange.end),
					},
				});

				const taskMetrics = this.calculateTaskMetrics(departmentTasks);
				const attendanceMetrics = this.calculateAttendanceMetrics(departmentAttendance);
				const productivity = this.calculateProductivityMetrics({
					tasks: taskMetrics,
					attendance: attendanceMetrics,
				});

				return {
					name: Department[deptId] || `Department ${deptId}`,
					headCount: users.length,
					attendance: attendanceMetrics,
					tasks: taskMetrics,
					productivity,
					topPerformers: await this.getTopPerformers(users, dateRange),
				};
			}),
		);
	}

	async userLiveOverview(userId: number): Promise<LiveUserReport> {
		try {
			const now = new Date();
			const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
			const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

			// Fetch user data with relations using query builder
			const user = await this.userRepository
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.userProfile', 'userProfile')
				.leftJoinAndSelect('user.branch', 'branch')
				.leftJoinAndSelect('user.organisation', 'organisation')
				.where('user.uid = :userId', { userId })
				.getOne();
			
			if (!user) {
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			// Generate a daily report first as the base
			const options: ReportGenerationOptions = {
				type: ReportType.DAILY_USER,
				format: ReportFormat.JSON,
				timeframe: ReportTimeframe.DAILY,
				startDate: startOfDay,
				endDate: endOfDay,
				userId: userId
			};

			// Get the daily report data
			const dailyReport = await this.generateDailyUserReport(options);

			// Fetch real-time data using the LiveUserReportService
			const currentTasksInProgress = await this.liveUserReportService.getCurrentTasksInProgress(userId);
			const nextTasks = await this.liveUserReportService.getNextTasks(userId);
			const taskTimeline = await this.liveUserReportService.getTaskTimeline(userId);
			const overdueTasks = await this.liveUserReportService.getOverdueTasks(userId);
			const taskEfficiency = await this.liveUserReportService.getTaskEfficiency(userId);
			const recentActivities = await this.liveUserReportService.getRecentActivities(userId);
			const isOnline = await this.liveUserReportService.checkUserOnlineStatus(userId);
			const currentActivity = await this.liveUserReportService.getCurrentActivity(userId);
			const location = await this.liveUserReportService.getUserLocation(userId);

			// Add live data
			const liveReport: LiveUserReport = {
				...dailyReport,
				lastUpdated: now,
				isOnline,
				currentActivity,
				location,
				currentTasksInProgress,
				nextTasks: nextTasks?.map(task => ({
					...task,
					deadline: task?.deadline || new Date()
				})),
				taskTimeline: taskTimeline?.map(task => ({
					...task,
					startTime: task?.startDate || new Date(),
					endTime: task?.endDate || new Date(),
					isCompleted: task?.status === TaskStatus.COMPLETED
				})),
				overdueTasks,
				taskEfficiency,
				recentActivities,
				summary: this.liveUserReportService.generateLiveReportSummary(user, dailyReport, {
					currentTasksInProgress,
					nextTasks: nextTasks?.map(task => ({
						...task,
						deadline: task.deadline || new Date()
					})),
					overdueTasks,
					taskEfficiency,
					isOnline
				})
			};

			return liveReport;
		} catch (error) {
			throw new Error(`Failed to generate live user report: ${error.message}`);
		}
	}
}
