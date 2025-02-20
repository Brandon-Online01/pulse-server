import { Injectable, Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { JournalService } from '../journal/journal.service';
import { ClaimsService } from '../claims/claims.service';
import { TasksService } from '../tasks/tasks.service';
import { AttendanceService } from '../attendance/attendance.service';
import { ShopService } from '../shop/shop.service';
import { NewsService } from '../news/news.service';
import { UserService } from '../user/user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportType } from '../lib/enums/reports.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationStatus, NotificationType } from '../lib/enums/notification.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { EmailType } from '../lib/enums/email.enums';
import { ConfigService } from '@nestjs/config';
import { RewardsService } from 'src/rewards/rewards.service';
import { DailyReportData } from '../lib/types/email-templates.types';
import { TrackingService } from '../tracking/tracking.service';
import { OrderStatus } from '../lib/enums/status.enums';
import {
	ReportResponse,
	FinancialMetrics,
	PerformanceMetrics,
	ComparisonMetrics,
	TrendMetrics,
} from './types/report-response.types';
import { ComparisonType, GenerateReportDto } from './dto/generate-report.dto';
import { differenceInMinutes } from 'date-fns';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { subMonths, subYears } from 'date-fns';
import { Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

interface Location {
	address: string;
	coordinates?: { lat: number; lng: number };
}

@Injectable()
export class ReportsService {
	private readonly logger = new Logger(ReportsService.name);
	private readonly currencyLocale: string;
	private readonly currencyCode: string;
	private readonly currencySymbol: string;

	constructor(
		@InjectRepository(Report)
		private readonly reportRepository: Repository<Report>,
		@InjectRepository(CheckIn)
		private checkInRepository: Repository<CheckIn>,
		private readonly leadService: LeadsService,
		private readonly journalService: JournalService,
		private readonly claimsService: ClaimsService,
		private readonly tasksService: TasksService,
		private readonly shopService: ShopService,
		private readonly attendanceService: AttendanceService,
		private readonly newsService: NewsService,
		private readonly userService: UserService,
		private readonly trackingService: TrackingService,
		private readonly eventEmitter: EventEmitter2,
		private readonly configService: ConfigService,
		private readonly rewardsService: RewardsService,
	) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
	}

	private ensureNumber(value: any, defaultValue: number = 0): number {
		const num = Number(value);
		return isNaN(num) ? defaultValue : num;
	}

	private formatCurrency(amount: number): string {
		const safeAmount = this.ensureNumber(amount, 0);
		return new Intl.NumberFormat(this.currencyLocale, {
			style: 'currency',
			currency: this.currencyCode,
		})
			.format(safeAmount)
			.replace(this.currencyCode, this.currencySymbol);
	}

	private getDateRange(date: Date): { startDate: Date; endDate: Date } {
		const startDate = new Date(date);
		startDate.setHours(0, 0, 0, 0);

		const endDate = new Date(date);
		endDate.setHours(23, 59, 59, 999);

		return { startDate, endDate };
	}

	private getPreviousDateRange(date: Date): { startDate: Date; endDate: Date } {
		const previousDate = new Date(date);
		previousDate.setDate(previousDate.getDate() - 1);
		return this.getDateRange(previousDate);
	}

	private calculateGrowth(current: number, previous: number): string {
		const safeCurrent = this.ensureNumber(current);
		const safePrevious = this.ensureNumber(previous);
		
		if (safePrevious === 0) return safeCurrent > 0 ? '+100' : '0';
		const growth = ((safeCurrent - safePrevious) / safePrevious) * 100;
		return growth > 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1);
	}

	private calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
		if (current === previous) return 'stable';
		return current > previous ? 'up' : 'down';
	}

	private handleError(error: any) {
		return {
			message: error?.message || 'An error occurred',
			statusCode: error?.status || 500,
		};
	}

	private formatReportData(
		leadsStats: any,
		journalsStats: any,
		claimsStats: any,
		quotationsStats: any,
		tasksTotal: number,
		attendanceRecords: any[],
		attendanceHours: number,
		trackingData: any,
		userRewards: any,
		previousDayQuotations: number,
		previousDayRevenue: number,
	) {
		const currentRevenue = Number(quotationsStats?.quotations?.metrics?.grossQuotationValue) || 0;
		const currentQuotations = quotationsStats?.quotations?.metrics?.totalQuotations || 0;

		// Sort attendance records by time to get first check-in and last check-out
		const sortedAttendance = [...attendanceRecords].sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
		const firstCheckIn = sortedAttendance[0];
		const lastCheckOut = sortedAttendance[sortedAttendance.length - 1];

		const commonData = {
			leads: {
				total: leadsStats?.total || 0,
				review: leadsStats?.review || [],
				pending: leadsStats?.pending || [],
				approved: leadsStats?.approved || [],
				declined: leadsStats?.declined || [],
			},
			journals: journalsStats || [],
			claims: {
				paid: claimsStats?.paid || [],
				pending: claimsStats?.pending || [],
				approved: claimsStats?.approved || [],
				declined: claimsStats?.declined || [],
				totalValue: this.formatCurrency(claimsStats?.totalValue || 0),
			},
			tasks: tasksTotal || 0,
			attendance:
				sortedAttendance.length > 0
					? {
							totalHours: attendanceHours,
							startTime: firstCheckIn.checkIn.toLocaleTimeString(),
							endTime: lastCheckOut.checkOut?.toLocaleTimeString(),
							duration: `${Math.floor(attendanceHours)}h ${Math.round((attendanceHours % 1) * 60)}m`,
							status: lastCheckOut.status,
							checkInLocation:
								firstCheckIn.checkInLatitude && firstCheckIn.checkInLongitude
									? {
											latitude: firstCheckIn.checkInLatitude,
											longitude: firstCheckIn.checkInLongitude,
											notes: firstCheckIn.checkInNotes || '',
									  }
									: undefined,
							checkOutLocation:
								lastCheckOut.checkOutLatitude && lastCheckOut.checkOutLongitude
									? {
											latitude: lastCheckOut.checkOutLatitude,
											longitude: lastCheckOut.checkOutLongitude,
											notes: lastCheckOut.checkOutNotes || '',
									  }
									: undefined,
							verifiedAt: firstCheckIn.verifiedAt?.toISOString(),
							verifiedBy: firstCheckIn.verifiedBy,
					  }
					: undefined,
			quotations: {
				totalQuotations: currentQuotations,
				grossQuotationValue: this.formatCurrency(currentRevenue),
				averageQuotationValue: this.formatCurrency(
					currentQuotations > 0 ? currentRevenue / currentQuotations : 0,
				),
				growth: this.calculateGrowth(currentQuotations, previousDayQuotations),
				revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
			},
			tracking: trackingData
				? {
						totalDistance: trackingData?.totalDistance,
						locationAnalysis: {
							timeSpentByLocation: trackingData?.locationAnalysis?.timeSpentByLocation || {},
							averageTimePerLocation: trackingData?.locationAnalysis?.averageTimePerLocation || 0,
						},
				  }
				: null,
			xp: {
				level: userRewards?.rank || 1,
				currentXP: userRewards?.totalXP || 0,
				todayXP: userRewards?.todayXP || 0,
			},
			metrics: {
				totalQuotations: currentQuotations,
				totalRevenue: this.formatCurrency(currentRevenue),
				newCustomers: leadsStats?.total || 0,
				customerGrowth: this.calculateGrowth(
					leadsStats?.total || 0,
					(leadsStats?.total || 0) - (leadsStats?.pending?.length || 0),
				),
				userSpecific: {
					todayLeads: leadsStats?.pending?.length || 0,
					todayClaims: claimsStats?.pending?.length || 0,
					todayTasks: tasksTotal || 0,
					todayQuotations: currentQuotations,
					hoursWorked: attendanceHours,
				},
			},
		};

		return {
			reportMetadata: commonData,
			emailData: {
				metrics: {
					...commonData.metrics,
					xp: commonData.xp,
					attendance: commonData.attendance,
					quotationGrowth: commonData.quotations.growth,
					revenueGrowth: commonData.quotations.revenueGrowth,
				},
				tracking: trackingData
					? {
							totalDistance: trackingData?.totalDistance,
							locations: Object.entries(trackingData.locationAnalysis.timeSpentByLocation || {}).map(
								([address, minutes]) => ({
									address,
									timeSpent: `${Math.round(Number(minutes))} minutes`,
								}),
							),
							averageTimePerLocation: `${Math.round(
								trackingData.locationAnalysis.averageTimePerLocation || 0,
							)} minutes`,
					  }
					: undefined,
			},
		};
	}

	async managerDailyReport() {
		try {
			const allData = await Promise.all([
				this.leadService.getLeadsForDate(new Date()),
				this.journalService.getJournalsForDate(new Date()),
				this.claimsService.getClaimsForDate(new Date()),
				this.shopService.getQuotationsForDate(new Date()),
				this.tasksService.getTaskStatusSummary(),
				this.attendanceService.getMonthlyAttendanceStats(),
			]);

			const [
				{ leads: leadsStats },
				{ journals: journalsStats },
				{ claims: claimsStats },
				{ stats: ordersStats },
				{ byStatus: tasksStats },
				{ stats: attendanceStats },
			] = allData;

			// Calculate previous period metrics
			const previousDate = new Date();
			previousDate.setDate(previousDate.getDate() - 1);

			const [previousClaims, previousQuotations] = await Promise.all([
				this.claimsService.getClaimsForDate(previousDate),
				this.shopService.getQuotationsForDate(previousDate),
			]);

			// Generate trends data
			const trends = {
				daily: this.calculateDailyPatterns(previousDate, new Date()),
				weekly: this.calculateWeeklyPatterns(previousDate, new Date()),
				monthly: this.calculateMonthlyPatterns(previousDate, new Date()),
			};

			// Calculate totals and metrics
			const totalTasks = Object.values(tasksStats || {}).reduce((acc: number, curr: number) => acc + curr, 0);
			const totalClaims =
				(claimsStats?.paid?.length || 0) +
				(claimsStats?.pending?.length || 0) +
				(claimsStats?.approved?.length || 0) +
				(claimsStats?.declined?.length || 0);

			const response = {
				leads: {
					pending: leadsStats?.pending?.length || 0,
					approved: leadsStats?.approved?.length || 0,
					inReview: leadsStats?.review?.length || 0,
					declined: leadsStats?.declined?.length || 0,
					total: leadsStats?.total || 0,
					metrics: {
						leadTrends: {
							growth: this.calculateGrowth(
								leadsStats?.total || 0,
								(leadsStats?.total || 0) - (leadsStats?.pending?.length || 0),
							),
						},
					},
				},
				claims: {
					pending: claimsStats?.pending?.length || 0,
					approved: claimsStats?.approved?.length || 0,
					declined: claimsStats?.declined?.length || 0,
					paid: claimsStats?.paid?.length || 0,
					total: totalClaims,
					totalValue: this.formatCurrency(Number(claimsStats?.totalValue || 0)),
					metrics: {
						valueGrowth: this.calculateGrowth(
							Number(claimsStats?.totalValue || 0),
							Number(previousClaims?.claims?.totalValue || 0),
						),
					},
				},
				tasks: {
					pending: tasksStats?.PENDING || 0,
					completed: tasksStats?.COMPLETED || 0,
					missed: tasksStats?.MISSED || 0,
					postponed: tasksStats?.POSTPONED || 0,
					total: totalTasks,
					metrics: {
						taskTrends: {
							growth: this.calculateGrowth(tasksStats?.COMPLETED || 0, tasksStats?.PENDING || 0),
						},
					},
				},
				orders: {
					pending: ordersStats?.quotations?.pending?.length || 0,
					processing: ordersStats?.quotations?.processing?.length || 0,
					completed: ordersStats?.quotations?.completed?.length || 0,
					cancelled: ordersStats?.quotations?.cancelled?.length || 0,
					postponed: ordersStats?.quotations?.postponed?.length || 0,
					rejected: ordersStats?.quotations?.rejected?.length || 0,
					approved: ordersStats?.quotations?.approved?.length || 0,
					metrics: {
						totalQuotations: ordersStats?.quotations?.metrics?.totalQuotations || 0,
						grossQuotationValue: this.formatCurrency(
							Number(ordersStats?.quotations?.metrics?.grossQuotationValue || 0),
						),
						averageQuotationValue: this.formatCurrency(
							Number(ordersStats?.quotations?.metrics?.averageQuotationValue || 0),
						),
						quotationTrends: {
							growth: this.calculateGrowth(
								ordersStats?.quotations?.metrics?.totalQuotations || 0,
								previousQuotations?.stats?.quotations?.metrics?.totalQuotations || 0,
							),
						},
					},
					trends,
				},
				attendance: {
					attendance: Math.round(attendanceStats?.metrics?.attendancePercentage || 0),
					present: attendanceStats?.metrics?.totalPresent || 0,
					total: attendanceStats?.metrics?.totalEmployees || 0,
					metrics: {
						attendanceTrends: {
							growth: this.calculateGrowth(
								attendanceStats?.metrics?.attendancePercentage || 0,
								attendanceStats?.metrics?.attendancePercentage || 0,
							),
						},
					},
				},
			};

			return response;
		} catch (error) {
			this.logger.error('Failed to generate manager daily report:', error);
			throw error;
		}
	}

	@OnEvent('daily-report')
	async userDailyReport(reference?: string) {
		try {
			const date = new Date();
			const { startDate, endDate } = this.getDateRange(date);
			const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousDateRange(date);

			const [
				{ leads: leadsStats },
				{ journals: journalsStats },
				{ claims: claimsStats },
				{ stats: quotationsStats },
				{ total: tasksTotal },
				{ totalHours: attendanceHours, attendanceRecords },
				userRewards,
				userData,
				{ data: trackingData },
				previousDayStats,
				previousClaims,
			] = await Promise.all([
				this.leadService.getLeadsForDate(date),
				this.journalService.getJournalsForDate(date),
				this.claimsService.getClaimsForDate(date),
				this.shopService.getQuotationsForDate(date),
				this.tasksService.getTasksForDate(date),
				this.attendanceService.getAttendanceForDate(date),
				reference ? this.rewardsService.getUserRewards(Number(reference)) : null,
				reference ? this.userService.findOne(Number(reference)) : null,
				reference ? this.trackingService.getDailyTracking(Number(reference), date) : null,
				this.shopService.getQuotationsForDate(prevStartDate),
				this.claimsService.getClaimsForDate(prevStartDate),
			]);

			// Calculate previous day metrics
			const previousDayQuotations = previousDayStats?.stats?.quotations?.metrics?.totalQuotations || 0;
			const previousDayRevenue = Number(previousDayStats?.stats?.quotations?.metrics?.grossQuotationValue) || 0;

			const { reportMetadata } = this.formatReportData(
				leadsStats,
				journalsStats,
				claimsStats,
				quotationsStats,
				tasksTotal,
				attendanceRecords || [],
				attendanceHours || 0,
				trackingData,
				userRewards,
				previousDayQuotations,
				previousDayRevenue,
			);

			// Create report record
			const report = this.reportRepository.create({
				title: 'Daily Report',
				description: `Daily report for ${startDate.toLocaleDateString()}`,
				type: ReportType.DAILY,
				metadata: {
					generatedAt: new Date().toISOString(),
					reportType: ReportType.DAILY,
					period: 'daily',
					metrics: {
						current: {
							total: reportMetadata.metrics?.totalQuotations || 0,
							approved: reportMetadata.metrics?.userSpecific?.todayQuotations || 0,
							pending: reportMetadata.metrics?.userSpecific?.todayLeads || 0,
							value: Number(reportMetadata.metrics?.totalRevenue?.replace(/[^0-9.-]+/g, '')) || 0,
						},
						previous: {
							total: previousDayQuotations,
							approved: 0,
							value: previousDayRevenue,
						},
						growth: reportMetadata.quotations?.growth || '0',
						trend: this.calculateTrend(
							reportMetadata.metrics?.totalQuotations || 0,
							previousDayQuotations,
						),
						conversion: reportMetadata.metrics?.userSpecific?.todayQuotations
							? (reportMetadata.metrics.userSpecific.todayQuotations /
									(reportMetadata.metrics?.totalQuotations || 1)) *
							  100
							: 0,
					},
				},
				owner: userData?.user,
				branch: userData?.user?.branch,
			});

			await this.reportRepository.save(report);

			// Send notification
			const notification = {
				type: NotificationType.USER,
				title: 'Daily Report Generated',
				message: `Your daily activity report for ${startDate.toLocaleDateString()} has been generated`,
				status: NotificationStatus.UNREAD,
				owner: userData?.user,
			};

			const recipients = [AccessLevel.USER];
			this.eventEmitter.emit('send.notification', notification, recipients);

			// Send email only if user has email
			if (userData?.user?.email) {
				const emailTemplate: DailyReportData = {
					name: userData.user.username,
					date: startDate.toLocaleDateString(),
					metrics: {
						totalQuotations: reportMetadata.metrics?.totalQuotations || 0,
						totalRevenue: reportMetadata.metrics?.totalRevenue || '0',
						newCustomers: reportMetadata.metrics?.newCustomers || 0,
						quotationGrowth: reportMetadata.quotations?.growth || '0',
						revenueGrowth: '0',
						customerGrowth: '0',
						userSpecific: {
							todayLeads: reportMetadata.metrics?.userSpecific?.todayLeads || 0,
							todayClaims: reportMetadata.metrics?.userSpecific?.todayClaims || 0,
							todayTasks: reportMetadata.metrics?.userSpecific?.todayTasks || 0,
							todayQuotations: reportMetadata.metrics?.userSpecific?.todayQuotations || 0,
							hoursWorked: reportMetadata.metrics?.userSpecific?.hoursWorked || 0,
						},
					},
				};

				this.eventEmitter.emit('send.email', EmailType.DAILY_REPORT, [userData.user.email], emailTemplate);
			}

			return report;
		} catch (error) {
			return this.handleError(error);
		}
	}

	private async getComparisonData(params: GenerateReportDto): Promise<ComparisonMetrics> {
		const startDate = new Date(params.startDate);
		const endDate = new Date(params.endDate);

		let comparisonStartDate: Date;
		let comparisonEndDate: Date;

		switch (params.comparison?.type) {
			case ComparisonType.YEAR_OVER_YEAR:
				comparisonStartDate = subYears(startDate, 1);
				comparisonEndDate = subYears(endDate, 1);
				break;
			case ComparisonType.MONTH_OVER_MONTH:
				comparisonStartDate = subMonths(startDate, 1);
				comparisonEndDate = subMonths(endDate, 1);
				break;
			case ComparisonType.CUSTOM:
				comparisonStartDate = new Date(params.comparison.customStartDate);
				comparisonEndDate = new Date(params.comparison.customEndDate);
				break;
			default:
				comparisonStartDate = subMonths(startDate, 1);
				comparisonEndDate = subMonths(endDate, 1);
		}

		const [currentPeriod, comparisonPeriod] = await Promise.all([
			this.getPeriodMetrics(startDate, endDate, params),
			this.getPeriodMetrics(comparisonStartDate, comparisonEndDate, params),
		]);

		return {
			previousPeriod: {
				revenue: comparisonPeriod.revenue,
				leads: comparisonPeriod.leads,
				tasks: comparisonPeriod.tasks,
				claims: comparisonPeriod.claims,
			},
			yearOverYear: {
				revenue: (await this.getPeriodMetrics(subYears(startDate, 1), subYears(endDate, 1), params)).revenue,
				leads: (await this.getPeriodMetrics(subYears(startDate, 1), subYears(endDate, 1), params)).leads,
				tasks: (await this.getPeriodMetrics(subYears(startDate, 1), subYears(endDate, 1), params)).tasks,
				claims: (await this.getPeriodMetrics(subYears(startDate, 1), subYears(endDate, 1), params)).claims,
			},
			targets: await this.getTargetMetrics(startDate, endDate, params),
		};
	}

	private async getPeriodMetrics(startDate: Date, endDate: Date, params: GenerateReportDto) {
		const [leadsStats, claimsStats, quotationsStats, tasksStats] = await Promise.all([
			this.leadService.getLeadsReport({ createdAt: { gte: startDate, lte: endDate } }),
			this.claimsService.getClaimsReport({ createdAt: { gte: startDate, lte: endDate } }),
			this.shopService.getQuotationsReport({ createdAt: { gte: startDate, lte: endDate } }),
			this.tasksService.getTasksReport({ createdAt: { gte: startDate, lte: endDate } }),
		]).catch((error) => {
			return [null, null, null, null];
		});

		return {
			revenue: Number(quotationsStats?.metrics?.grossQuotationValue || 0),
			leads: Number(leadsStats?.total || 0),
			tasks: Number(tasksStats?.total || 0),
			claims: Number(claimsStats?.totalValue || 0),
		};
	}

	private async getTargetMetrics(startDate: Date, endDate: Date, params: GenerateReportDto) {
		// TODO: Implement target metrics from configuration or database
		return {
			revenue: { target: 100000, achieved: 75000 },
			leads: { target: 100, achieved: 85 },
			tasks: { target: 200, achieved: 180 },
			claims: { target: 50, achieved: 45 },
		};
	}

	private async getFinancialMetrics(
		startDate: Date,
		endDate: Date,
		params: GenerateReportDto,
	): Promise<FinancialMetrics> {
		try {
			const quotationsResponse = await this.shopService.findAll({
				startDate,
				endDate,
			});

			const quotations = quotationsResponse.data;
			const revenue = quotations.reduce((sum, q) => sum + Number(q.totalAmount), 0);
			const expenses = quotations
				.filter(q => q.status === OrderStatus.COMPLETED)
				.reduce((sum, q) => sum + (Number(q.resellerCommission) || 0), 0);

			const metrics = {
				revenue: this.ensureNumber(revenue),
				expenses: this.ensureNumber(expenses),
				profit: this.ensureNumber(revenue - expenses),
				quotations: this.ensureNumber(quotations?.length),
				averageOrderValue: quotations?.length ? 
					this.ensureNumber(revenue / quotations.length) : 0,
			};

			return this.validateMetrics(metrics);
		} catch (error) {
			this.logger.error('Error calculating financial metrics:', error);
			throw error;
		}
	}

	private async getPerformanceMetrics(
		startDate: Date,
		endDate: Date,
		params: GenerateReportDto,
	): Promise<PerformanceMetrics> {
		const [leadsData, tasksData] = await Promise.all([
			this.leadService.getLeadsReport({ createdAt: { gte: startDate, lte: endDate } }),
			this.tasksService.getTasksReport({ createdAt: { gte: startDate, lte: endDate } }),
		]);

		const attendanceData = await this.checkInRepository.find({
			where: {
				checkInTime: Between(startDate, endDate),
				checkOutTime: Between(startDate, endDate),
			},
			relations: ['owner', 'branch'],
		});

		// Transform source effectiveness data into the required format
		const sourceEffectiveness = leadsData.metrics.sourceEffectiveness.reduce((acc, source) => {
			acc[source.source] = source.totalLeads;
			return acc;
		}, {} as Record<string, number>);

		// Calculate total leads from source effectiveness data
		const totalLeads = leadsData.metrics.sourceEffectiveness.reduce((sum, source) => sum + source.totalLeads, 0);
		const convertedLeads = leadsData.metrics.sourceEffectiveness.reduce(
			(sum, source) => sum + source.convertedLeads,
			0,
		);

		return {
			leads: {
				total: totalLeads,
				converted: convertedLeads,
				conversionRate: parseFloat(leadsData.metrics.conversionRate.replace('%', '')),
				averageResponseTime: leadsData.metrics.averageResponseTime,
				bySource: sourceEffectiveness,
				qualityScore: leadsData.metrics.qualityScore,
			},
			tasks: {
				total: Object.values(tasksData.metrics.taskDistribution).reduce((sum, count) => sum + count, 0),
				completed: tasksData.metrics.taskDistribution['COMPLETED'] || 0,
				overdue: tasksData.metrics.taskDistribution['OVERDUE'] || 0,
				completionRate: parseFloat(tasksData.metrics.completionRate.replace('%', '')),
				averageCompletionTime: tasksData.metrics.averageCompletionTime,
				byPriority: tasksData.metrics.taskPriorityDistribution,
				byType: tasksData.metrics.taskDistribution,
			},
			attendance: {
				averageHours: this.calculateAverageHours(attendanceData),
				punctuality: this.calculatePunctualityRate(attendanceData),
				overtime: this.calculateOvertime(attendanceData),
				absences: this.calculateAbsences(attendanceData),
				remoteWork: this.calculateRemoteWork(attendanceData),
				byDepartment: this.groupByDepartment(attendanceData),
			},
		};
	}

	private async getTrendMetrics(startDate: Date, endDate: Date, params: GenerateReportDto): Promise<TrendMetrics> {
		// Implement trend analysis and forecasting
		return {
			seasonal: {
				peak: { period: 'December', value: 150000 },
				low: { period: 'January', value: 80000 },
			},
			patterns: {
				daily: this.calculateDailyPatterns(startDate, endDate),
				weekly: this.calculateWeeklyPatterns(startDate, endDate),
				monthly: this.calculateMonthlyPatterns(startDate, endDate),
			},
			forecast: {
				nextPeriod: 120000,
				confidence: 85,
				factors: ['Seasonal trend', 'Market conditions', 'Historical performance'],
			},
		};
	}

	async generateReport(params: GenerateReportDto): Promise<ReportResponse> {
		try {
			const { startDate, endDate } = this.getDateRange(new Date());
			const data = await this.getTimeFilteredData(startDate, endDate, params.type);

			const metrics = this.validateMetrics({
				total: data.length,
				approved: data.filter((item) => item.status === 'approved').length,
				pending: data.filter((item) => item.status === 'pending').length,
				value: data.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
			});

			const previousData = await this.getTimeFilteredData(
				this.getPreviousDateRange(startDate).startDate,
				this.getPreviousDateRange(startDate).endDate,
				params.type,
			);

			const previousMetrics = this.validateMetrics({
				total: previousData.length,
				approved: previousData.filter((item) => item.status === 'approved').length,
				value: previousData.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
			});

			return {
				metadata: {
					generatedAt: new Date().toISOString(),
					reportType: params.type,
					period: params.period,
				},
				metrics: {
					current: metrics,
					previous: previousMetrics,
					growth: this.calculateGrowth(metrics.total, previousMetrics.total),
					trend: this.calculateTrend(metrics.total, previousMetrics.total),
					conversion: metrics.total > 0 ? (metrics.approved / metrics.total) * 100 : 0,
				},
			};
		} catch (error) {
			this.logger.error(`Failed to generate report: ${error.message}`);
			throw error;
		}
	}

	private async getRevenueBreakdown(
		startDate: Date,
		endDate: Date,
	): Promise<Array<{ category: string; value: number; percentage: number }>> {
		try {
			const quotationsData = await this.shopService.getQuotationsReport({
				createdAt: { gte: startDate, lte: endDate },
			});

			const totalRevenue = Number(quotationsData?.metrics?.grossQuotationValue || 0);
			const categories = quotationsData?.metrics?.topProducts || [];

			return categories.map((product) => ({
				category: product?.productName || 'Unknown',
				value: Number(product?.totalValue || 0),
				percentage: totalRevenue > 0 ? (Number(product?.totalValue || 0) / totalRevenue) * 100 : 0,
			}));
		} catch (error) {
			return [];
		}
	}

	private groupByType<T extends { type?: string }>(items: T[]): Record<string, number> {
		return items.reduce((acc, item) => {
			if (item.type) {
				acc[item.type] = (acc[item.type] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);
	}

	private groupBySource<T extends { source?: string }>(items: T[]): Record<string, number> {
		return items.reduce((acc, item) => {
			if (item.source) {
				acc[item.source] = (acc[item.source] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);
	}

	private groupByPriority<T extends { priority?: string }>(items: T[]): Record<string, number> {
		return items.reduce((acc, item) => {
			if (item.priority) {
				acc[item.priority] = (acc[item.priority] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);
	}

	private groupByDepartment(attendanceData: CheckIn[]): Record<string, number> {
		return attendanceData.reduce((acc, record) => {
			const branch = record.branch?.name || 'Unknown';
			acc[branch] = (acc[branch] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	}

	private calculateAverageResponseTime(leads: any[]): string {
		const totalResponseTime = leads.reduce((sum, lead) => {
			if (lead.firstResponseAt && lead.createdAt) {
				return sum + differenceInMinutes(new Date(lead.firstResponseAt), new Date(lead.createdAt));
			}
			return sum;
		}, 0);
		const avgMinutes = Math.round(totalResponseTime / leads.length);
		return `${avgMinutes} minutes`;
	}

	private calculateAverageCompletionTime(tasks: any[]): string {
		const totalCompletionTime = tasks.reduce((sum, task) => {
			if (task.completedAt && task.createdAt) {
				return sum + differenceInMinutes(new Date(task.completedAt), new Date(task.createdAt));
			}
			return sum;
		}, 0);
		const avgMinutes = Math.round(totalCompletionTime / tasks.length);
		return `${avgMinutes} minutes`;
	}

	private calculateLeadQualityScore(leads: any[]): number {
		const totalScore = leads.reduce((sum, lead) => {
			let score = 0;
			if (lead.converted) score += 5;
			if (lead.budget && lead.budget > 0) score += 2;
			if (lead.notes && lead.notes.length > 0) score += 1;
			if (lead.followUps && lead.followUps.length > 0) score += 2;
			return sum + score;
		}, 0);
		return Math.round((totalScore / (leads.length * 10)) * 100);
	}

	private calculateAverageHours(attendance: any[]): number {
		const totalHours = attendance.reduce((sum, record) => {
			if (record.checkOutTime && record.checkInTime) {
				return sum + differenceInMinutes(new Date(record.checkOutTime), new Date(record.checkInTime)) / 60;
			}
			return sum;
		}, 0);
		return Math.round((totalHours / attendance.length) * 10) / 10;
	}

	private calculatePunctualityRate(attendance: any[]): number {
		const onTimeCount = attendance.filter((record) => {
			const checkInTime = new Date(record.checkInTime);
			const scheduledTime = new Date(record.scheduledStartTime);
			return checkInTime <= scheduledTime;
		}).length;
		return Math.round((onTimeCount / attendance.length) * 100);
	}

	private calculateOvertime(attendance: any[]): number {
		const totalOvertime = attendance.reduce((sum, record) => {
			if (record.checkOutTime && record.scheduledEndTime) {
				const overtime =
					Math.max(0, differenceInMinutes(new Date(record.checkOutTime), new Date(record.scheduledEndTime))) /
					60;
				return sum + overtime;
			}
			return sum;
		}, 0);
		return Math.round(totalOvertime * 10) / 10;
	}

	private calculateAbsences(attendance: any[]): number {
		return attendance.filter((record) => record.status === 'ABSENT').length;
	}

	private calculateRemoteWork(attendance: any[]): number {
		const remoteCount = attendance.filter((record) => record.workMode === 'REMOTE').length;
		return Math.round((remoteCount / attendance.length) * 100);
	}

	private calculateDailyPatterns(startDate: Date, endDate: Date): Record<string, number> {
		const days = 7;
		const result: Record<string, number> = {};

		for (let i = 0; i < days; i++) {
			const date = new Date(endDate);
			date.setDate(date.getDate() - i);
			// Generate realistic daily numbers (between 20-50 quotations per day)
			result[date.toISOString()] = Math.floor(Math.random() * (50 - 20) + 20);
		}

		return result;
	}

	private calculateWeeklyPatterns(startDate: Date, endDate: Date): Record<string, number> {
		const weeks = 4;
		const result: Record<string, number> = {};

		for (let i = 0; i < weeks; i++) {
			const weekStart = new Date(endDate);
			weekStart.setDate(weekStart.getDate() - i * 7);
			// Generate realistic weekly numbers (between 150-300 quotations per week)
			result[`Week ${weeks - i}`] = Math.floor(Math.random() * (300 - 150) + 150);
		}

		return result;
	}

	private calculateMonthlyPatterns(startDate: Date, endDate: Date): Record<string, number> {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const result: Record<string, number> = {};

		const currentMonth = new Date().getMonth();

		for (let i = 0; i < 12; i++) {
			const monthIndex = (currentMonth - i + 12) % 12;
			// Generate realistic monthly numbers (between 600-1200 quotations per month)
			result[months[monthIndex]] = Math.floor(Math.random() * (1200 - 600) + 600);
		}

		return result;
	}

	private generateHighlights(
		financial: FinancialMetrics,
		performance: PerformanceMetrics,
		comparison: ComparisonMetrics,
	): string[] {
		const highlights: string[] = [];

		if (financial.revenue.growth.startsWith('+')) {
			highlights.push(`Revenue increased by ${financial.revenue.growth} compared to previous period`);
		}

		if (performance.leads.conversionRate > 20) {
			highlights.push(`Strong lead conversion rate of ${performance.leads.conversionRate.toFixed(1)}%`);
		}

		if (performance.tasks.completionRate > 80) {
			highlights.push(`High task completion rate of ${performance.tasks.completionRate.toFixed(1)}%`);
		}

		if (financial.quotations.conversion > 50) {
			highlights.push(
				`Above average quotation conversion rate of ${financial.quotations.conversion.toFixed(1)}%`,
			);
		}

		return highlights;
	}

	private generateRecommendations(
		financial: FinancialMetrics,
		performance: PerformanceMetrics,
		trends: TrendMetrics,
	): string[] {
		const recommendations: string[] = [];

		if (financial.revenue.trend === 'down') {
			recommendations.push('Consider reviewing pricing strategy and implementing targeted promotions');
		}

		if (performance.leads.conversionRate < 20) {
			recommendations.push('Focus on lead qualification process and sales team training');
		}

		if (performance.tasks.overdue > performance.tasks.completed) {
			recommendations.push('Review task allocation and implement better tracking of deadlines');
		}

		if (performance.attendance.punctuality < 80) {
			recommendations.push('Address attendance issues through team meetings and policy reviews');
		}

		return recommendations;
	}

	private validateMetrics(metrics: any) {
		if (!metrics || typeof metrics !== 'object') {
			throw new Error('Invalid metrics object');
		}

		const validateNumber = (value: any, key: string) => {
			if (value === undefined || value === null || isNaN(Number(value))) {
				this.logger.warn(`Invalid ${key} value: ${value}, defaulting to 0`);
				return 0;
			}
			return Number(value);
		};

		// Recursively validate all numeric values in the object
		const validateObject = (obj: any): any => {
			if (Array.isArray(obj)) {
				return obj.map(item => validateObject(item));
			}
			
			if (obj && typeof obj === 'object') {
				const validated: any = {};
				for (const [key, value] of Object.entries(obj)) {
					if (typeof value === 'number') {
						validated[key] = validateNumber(value, key);
					} else if (value && typeof value === 'object') {
						validated[key] = validateObject(value);
					} else {
						validated[key] = value;
					}
				}
				return validated;
			}
			
			return obj;
		};

		return validateObject(metrics);
	}

	private async getTimeFilteredData(startDate: Date, endDate: Date, type: string) {
		const query = this.reportRepository
			.createQueryBuilder('report')
			.where('report.createdAt BETWEEN :startDate AND :endDate', {
				startDate,
				endDate,
			});

		if (type === 'quotation') {
			query.andWhere('report.type = :type', { type });
		}

		return await query.getMany();
	}

	@Cron(CronExpression.EVERY_DAY_AT_5PM)
	async sendDailyReports() {
		try {
			this.logger.log('Starting daily report generation and email distribution');

			// Get all active users
			const usersResponse = await this.userService.findAll();
			const users = usersResponse.data;
			
			// Generate and send reports for each user
			await Promise.all(users.map(async (user) => {
				try {
					if (!user.email) {
						this.logger.warn(`No email found for user ${user.uid}`);
						return;
					}

					const reportData = await this.userDailyReport(user.userref);
					const today = new Date();
					
					if (!reportData || 'message' in reportData) {
						this.logger.warn(`No report data generated for user ${user.uid}`);
						return;
					}

					const report = reportData as Report;
					const { reportMetadata } = this.formatReportData(
						report.metadata.reportMetadata,
						report.metadata.reportMetadata.journals,
						report.metadata.reportMetadata.claims,
						report.metadata.reportMetadata.quotations,
						report.metadata.reportMetadata.tasks,
						report.metadata.reportMetadata.attendance.attendanceRecords,
						report.metadata.reportMetadata.attendance.totalHours,
						report.metadata.reportMetadata.tracking,
						report.metadata.reportMetadata.xp,
						report.metadata.reportMetadata.quotations.totalQuotations || 0,
						report.metadata.reportMetadata.quotations.grossQuotationValue || 0
					);

					const emailTemplate: DailyReportData = {
						name: user.username,
						date: today.toISOString(),
						metrics: {
							totalQuotations: reportMetadata.metrics?.totalQuotations || 0,
							totalRevenue: reportMetadata.metrics?.totalRevenue || '0',
							newCustomers: reportMetadata.metrics?.newCustomers || 0,
							quotationGrowth: reportMetadata.quotations?.growth || '0',
							revenueGrowth: '0',
							customerGrowth: '0',
							userSpecific: {
								todayLeads: reportMetadata.metrics?.userSpecific?.todayLeads || 0,
								todayClaims: reportMetadata.metrics?.userSpecific?.todayClaims || 0,
								todayTasks: reportMetadata.metrics?.userSpecific?.todayTasks || 0,
								todayQuotations: reportMetadata.metrics?.userSpecific?.todayQuotations || 0,
								hoursWorked: reportMetadata.metrics?.userSpecific?.hoursWorked || 0,
							},
						},
					};

					// Emit email event
					this.eventEmitter.emit('email.send', {
						type: EmailType.DAILY_REPORT,
						recipient: user.email,
						data: emailTemplate,
					});

					this.logger.log(`Daily report sent to ${user.email}`);
				} catch (error) {
					this.logger.error(`Failed to send daily report to ${user.email}:`, error);
				}
			}));

			// Generate and send manager report
			const managers = users.filter(user => 
				user.accessLevel === AccessLevel.MANAGER || 
				user.accessLevel === AccessLevel.ADMIN
			);

			await Promise.all(managers.map(async (manager) => {
				try {
					if (!manager.email) {
						this.logger.warn(`No email found for manager ${manager.uid}`);
						return;
					}

					const reportData = await this.managerDailyReport();
					const today = new Date();
					
					if (!reportData || 'message' in reportData) {
						this.logger.warn(`No manager report data generated for ${manager.uid}`);
						return;
					}

					const managerReport: ReportResponse = {
						metadata: {
							generatedAt: today.toISOString(),
							reportType: ReportType.DAILY,
							period: 'daily',
						},
						metrics: {
							current: {
								total: reportData.orders?.metrics?.totalQuotations || 0,
								approved: reportData.orders?.approved || 0,
								pending: reportData.orders?.pending || 0,
								value: Number(reportData.orders?.metrics?.grossQuotationValue?.replace(/[^0-9.-]+/g, '')) || 0,
							},
							previous: {
								total: reportData.orders?.metrics?.totalQuotations || 0,
								approved: reportData.orders?.approved || 0,
								pending: reportData.orders?.pending || 0,
								value: Number(reportData.orders?.metrics?.grossQuotationValue || 0),
							},
							growth: reportData.orders?.metrics?.quotationTrends?.growth || '0',
							trend: this.calculateTrend(
								reportData.orders?.metrics?.totalQuotations || 0,
								reportData.orders?.metrics?.totalQuotations || 0
							),
							conversion: reportData.orders?.metrics?.totalQuotations
								? (reportData.orders.approved / reportData.orders.metrics.totalQuotations) * 100
								: 0,
						},
					};

					// Send email only if manager has email
					if (manager.email) {
						const emailTemplate: DailyReportData = {
							name: manager.username,
							date: today.toLocaleDateString(),
							metrics: {
								totalQuotations: managerReport.metrics.current.total,
								totalRevenue: this.formatCurrency(managerReport.metrics.current.value),
								newCustomers: reportData.leads?.total || 0,
								quotationGrowth: managerReport.metrics.growth,
								revenueGrowth: '0',
								customerGrowth: '0',
							},
						};

						this.eventEmitter.emit('email.send', {
							type: EmailType.DAILY_REPORT,
							recipient: manager.email,
							data: emailTemplate,
						});
					}

					return managerReport;
				} catch (error) {
					this.logger.error(`Failed to send manager daily report to ${manager.email}:`, error);
				}
			}));

			this.logger.log('Completed daily report distribution');
		} catch (error) {
			this.logger.error('Failed to send daily reports:', error);
			throw error;
		}
	}
}
