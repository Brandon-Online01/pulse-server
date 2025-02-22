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
import { Reward } from '../rewards/entities/reward.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Report } from './entities/report.entity';
import { 
	ReportType, 
	ReportFormat, 
	ReportStatus, 
	ReportTimeframe, 
	ReportMetricType 
} from '../lib/enums/report.enums';
import { TaskStatus, TaskPriority, TaskType } from '../lib/enums/task.enums';
import { AttendanceStatus } from '../lib/enums/attendance.enums';
import { LeadStatus } from '../lib/enums/lead.enums';
import { JournalStatus } from '../lib/enums/journal.enums';
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
	DepartmentMetrics
} from './report.types';
import { Achievement } from '../rewards/entities/achievement.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class ReportsService {
	private readonly currencyLocale: string;
	private readonly currencyCode: string;
	private readonly currencySymbol: string;

	constructor(
		private readonly configService: ConfigService,
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
	) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
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

		if (options.userId) {
			const user = await this.userRepository.findOne({ 
				where: { uid: options.userId }
			});
			if (!user) throw new NotFoundException('User not found');
			report.owner = user;
			report.ownerUid = user.uid;
		}

		if (options.organisationRef) {
			const organisation = await this.organisationRepository.findOne({ 
				where: { ref: options.organisationRef }
			});
			if (!organisation) throw new NotFoundException('Organisation not found');
			report.organisation = organisation;
			report.organisationRef = organisation.ref;
		}

		if (options.branchUid) {
			const branch = await this.branchRepository.findOne({ 
				where: { uid: options.branchUid }
			});
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
				generationTime: Date.now() - report.createdAt.getTime(),
				dataPoints: this.countDataPoints(data),
				version: '2.0',
				source: 'system'
			};
			
			return await this.reportRepository.save(report);
		} catch (error) {
			report.status = ReportStatus.FAILED;
			report.errorMessage = error.message;
			await this.reportRepository.save(report);
			throw error;
		}
	}

	async generateDailyUserReport(options: ReportGenerationOptions): Promise<DailyUserActivityReport> {
		if (!options.userId) throw new Error('User ID is required for daily report');
		
		const dateRange = {
			start: options.startDate,
			end: options.endDate
		};

		// Fetch all required data
		const [
			attendanceRecords,
			tasks,
			clientVisits,
			leads,
			achievements,
			journals
		] = await Promise.all([
			this.attendanceRepository.find({
				where: {
					owner: { uid: options.userId },
					checkIn: Between(dateRange.start, dateRange.end)
				}
			}),
			this.taskRepository.find({
				where: {
					creator: { uid: options.userId },
					createdAt: Between(dateRange.start, dateRange.end)
				}
			}),
			this.checkInRepository.find({
				where: {
					owner: { uid: options.userId },
					checkInTime: Between(dateRange.start, dateRange.end)
				},
				relations: ['client']
			}),
			this.leadRepository.find({
				where: {
					owner: { uid: options.userId },
					createdAt: Between(dateRange.start, dateRange.end)
				}
			}),
			this.achievementRepository.find({
				where: {
					userRewards: { owner: { uid: options.userId } },
					createdAt: Between(dateRange.start, dateRange.end)
				}
			}),
			this.journalRepository.find({
				where: {
					owner: { uid: options.userId },
					createdAt: Between(dateRange.start, dateRange.end)
				}
			})
		]);

		// Calculate metrics
		const attendance = this.calculateAttendanceMetrics(attendanceRecords);
		const clientVisitMetrics = this.calculateClientVisitMetrics(clientVisits);
		const taskMetrics = this.calculateTaskMetrics(tasks);
		const quotationMetrics = this.calculateQuotationMetrics(leads);
		const rewardMetrics = this.calculateRewardMetrics(achievements);
		const journalMetrics = this.calculateJournalMetrics(journals);
		const productivity = this.calculateProductivityMetrics({
			tasks: taskMetrics,
			attendance,
			clientVisits: clientVisitMetrics,
			quotations: quotationMetrics
		});

		return {
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
				productivity
			})
		};
	}

	async generateDashboardReport(options: ReportGenerationOptions): Promise<DashboardAnalyticsReport> {
		if (!options.organisationRef) throw new Error('Organisation reference is required for dashboard report');

		const dateRange = {
			start: options.startDate,
			end: options.endDate
		};

		// Fetch organisation data
		const organisation = await this.organisationRepository.findOne({
			where: { ref: options.organisationRef },
			relations: ['users']
		});

		if (!organisation) throw new NotFoundException('Organisation not found');

		// Get unique departments from users
		const departmentIds = [...new Set(organisation.users.map(u => u.departmentId))];

		// Calculate department metrics
		const departments = await Promise.all(
			departmentIds.map(async (deptId) => {
				const users = await this.userRepository.find({
					where: { departmentId: deptId }
				});

				const departmentTasks = await this.taskRepository.find({
					where: {
						creator: { uid: In(users.map(u => u.uid)) },
						createdAt: Between(dateRange.start, dateRange.end)
					}
				});

				const departmentAttendance = await this.attendanceRepository.find({
					where: {
						owner: { uid: In(users.map(u => u.uid)) },
						checkIn: Between(dateRange.start, dateRange.end)
					}
				});

				const taskMetrics = this.calculateTaskMetrics(departmentTasks);
				const attendanceMetrics = this.calculateAttendanceMetrics(departmentAttendance);
				const productivity = this.calculateProductivityMetrics({
					tasks: taskMetrics,
					attendance: attendanceMetrics
				});

				return {
					name: Department[deptId] || `Department ${deptId}`,
					headCount: users.length,
					attendance: attendanceMetrics,
					tasks: taskMetrics,
					productivity,
					topPerformers: await this.getTopPerformers(users, dateRange)
				};
			})
		);

		// Calculate overall metrics
		const overview = await this.calculateOrganisationOverview(organisation, dateRange);
		const trends = await this.calculateOrganisationTrends(organisation, dateRange);
		const topMetrics = await this.calculateTopMetrics(organisation, dateRange);

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
				topMetrics
			})
		};
	}

	private calculateAttendanceMetrics(records: Attendance[]): AttendanceMetrics {
		const totalDays = records.length;
		const presentDays = records.filter(r => r.checkOut).length;
		const lateCheckIns = records.filter(r => this.isLateCheckIn(r.checkIn)).length;
		
		let totalHours = 0;
		let totalOvertime = 0;

		records.forEach(record => {
			if (record.checkOut) {
				const duration = record.checkOut.getTime() - record.checkIn.getTime();
				const hours = duration / (1000 * 60 * 60);
				totalHours += hours;
				if (hours > 8) totalOvertime += hours - 8;
			}
		});

		return {
			totalDays,
			presentDays,
			absentDays: totalDays - presentDays,
			attendanceRate: (presentDays / totalDays) * 100,
			averageCheckInTime: this.calculateAverageTime(records.map(r => r.checkIn)),
			averageCheckOutTime: this.calculateAverageTime(records.filter(r => r.checkOut).map(r => r.checkOut)),
			averageHoursWorked: totalHours / presentDays,
			totalOvertime,
			onTimeCheckIns: totalDays - lateCheckIns,
			lateCheckIns
		};
	}

	private calculateClientVisitMetrics(visits: CheckIn[]): ClientVisitMetrics {
		const uniqueClients = new Set(visits.map(v => v.client?.uid)).size;
		const totalDuration = visits.reduce((sum, v) => sum + (Number(v.duration) || 0), 0);

		return {
			totalVisits: visits.length,
			uniqueClients,
			averageTimePerVisit: totalDuration / visits.length,
			totalDuration,
			byPurpose: this.groupBy(visits, 'checkInLocation'),
			conversionRate: 0 // This needs to be calculated from a different source
		};
	}

	private calculateTaskMetrics(tasks: Task[]): TaskMetrics {
		const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
		const total = tasks.length;

		return {
			total,
			completed,
			inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
			pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
			overdue: tasks.filter(t => t.isOverdue).length,
			completionRate: (completed / total) * 100,
			averageCompletionTime: this.calculateAverageCompletionTime(tasks),
			byPriority: {
				high: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
				medium: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
				low: tasks.filter(t => t.priority === TaskPriority.LOW).length
			},
			byType: this.groupBy(tasks, 'taskType')
		};
	}

	private calculateQuotationMetrics(leads: Lead[]): QuotationMetrics {
		const approved = leads.filter(q => q.status === LeadStatus.APPROVED);
		const total = leads.length;
		const totalValue = 0; // This needs to be calculated from a different source

		return {
			total,
			approved: approved.length,
			rejected: leads.filter(q => q.status === LeadStatus.DECLINED).length,
			pending: leads.filter(q => q.status === LeadStatus.PENDING).length,
			conversionRate: (approved.length / total) * 100,
			averageValue: totalValue / approved.length,
			totalValue,
			byProduct: this.groupBy(leads, 'name')
		};
	}

	private calculateRewardMetrics(achievements: Achievement[]): RewardMetrics {
		return {
			totalXP: achievements.reduce((sum, r) => sum + (r.xpValue || 0), 0),
			totalRewards: achievements.length,
			byCategory: this.groupBy(achievements, 'category'),
			achievements: achievements.map(r => ({
				name: r.name,
				earnedAt: r.createdAt,
				xpValue: r.xpValue
			}))
		};
	}

	private calculateJournalMetrics(journals: Journal[]): JournalMetrics {
		const byCategory = this.groupBy(journals, 'type' as keyof Journal);
		const sortedCategories = Object.entries(byCategory)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([category]) => category);

		return {
			total: journals.length,
			byCategory,
			averageEntriesPerDay: journals.length / this.getDaysBetween(
				journals[0]?.createdAt,
				journals[journals.length - 1]?.createdAt
			),
			topCategories: sortedCategories
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
			? (data.clientVisits.conversionRate + 
			   (data.quotations?.conversionRate || 0)) / 2
			: 0;
		
		const responseTime = this.calculateAverageResponseTime(data);
		const qualityScore = this.calculateQualityScore(data);

		return {
			score: (taskEfficiency + clientHandling + qualityScore) / 3,
			taskEfficiency,
			clientHandling,
			responseTime,
			qualityScore
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
		const avgMinutes = times.reduce((sum, time) => {
			return sum + time.getHours() * 60 + time.getMinutes();
		}, 0) / times.length;
		
		const hours = Math.floor(avgMinutes / 60);
		const minutes = Math.floor(avgMinutes % 60);
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

	private calculateAverageCompletionTime(tasks: Task[]): number {
		const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.completionDate);
		if (!completedTasks.length) return 0;
		
		return completedTasks.reduce((sum, task) => {
			const duration = task.completionDate.getTime() - task.createdAt.getTime();
			return sum + duration;
		}, 0) / completedTasks.length / (1000 * 60 * 60); // Convert to hours
	}

	private groupBy<T>(items: T[], key: keyof T): Record<string, number> {
		return items.reduce((acc, item) => {
			const value = String(item[key]);
			acc[value] = (acc[value] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
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

	private async getTopPerformers(users: User[], dateRange: { start: Date; end: Date }): Promise<Array<{ userId: number; name: string; score: number }>> {
		const performanceScores = await Promise.all(
			users.map(async (user) => {
				const tasks = await this.taskRepository.find({
					where: {
						creator: { uid: user.uid },
						createdAt: Between(dateRange.start, dateRange.end)
					}
				});

				const attendance = await this.attendanceRepository.find({
					where: {
						owner: { uid: user.uid },
						checkIn: Between(dateRange.start, dateRange.end)
					}
				});

				const taskMetrics = this.calculateTaskMetrics(tasks);
				const attendanceMetrics = this.calculateAttendanceMetrics(attendance);
				const productivity = this.calculateProductivityMetrics({
					tasks: taskMetrics,
					attendance: attendanceMetrics
				});

				return {
					userId: user.uid,
					name: `${user.name} ${user.surname}`,
					score: productivity.score
				};
			})
		);

		return performanceScores.sort((a, b) => b.score - a.score).slice(0, 5);
	}

	private async calculateOrganisationOverview(organisation: Organisation, dateRange: { start: Date; end: Date }): Promise<{
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
					createdAt: Between(dateRange.start, dateRange.end)
				}
			}),
			this.clientRepository.count({
				where: {
					organisation: { ref: organisation.ref },
					createdAt: Between(dateRange.start, dateRange.end)
				}
			}),
			
			this.leadRepository.count({
				where: {
					createdAt: Between(dateRange.start, dateRange.end),
					status: LeadStatus.CONVERTED
				}
			})
		]);

		const activeUsers = await this.userRepository.count({
			where: {
				organisationRef: organisation.ref,
				status: 'active'
			}
		});

		return {
			totalUsers: organisation.users.length,
			activeUsers,
			totalTasks: tasks,
			totalClients: clients,
			totalQuotations: leads,
			totalRevenue: 0 // This would need to be calculated from actual revenue data
		};
	}

	private async calculateOrganisationTrends(organisation: Organisation, dateRange: { start: Date; end: Date }): Promise<{
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
			productivity: []
		};
	}

	private async calculateTopMetrics(organisation: Organisation, dateRange: { start: Date; end: Date }): Promise<{
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
			products: []
		};
	}
}
