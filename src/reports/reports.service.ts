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
import {
	ReportResponse,
	FinancialMetrics,
	PerformanceMetrics,
	ComparisonMetrics,
	TrendMetrics,
} from './types/report-response.types';
import { ComparisonType, GenerateReportDto, ReportFormat } from './dto/generate-report.dto';
import { differenceInMinutes } from 'date-fns';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { subMonths, subYears, format as formatDate } from 'date-fns';
import { Between } from 'typeorm';

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

	private formatCurrency(amount: number): string {
		return new Intl.NumberFormat(this.currencyLocale, {
			style: 'currency',
			currency: this.currencyCode,
		})
			.format(amount)
			.replace(this.currencyCode, this.currencySymbol);
	}

	private calculateGrowth(current: number, previous: number): string {
		if (previous === 0) return '+100%';
		const growth = ((current - previous) / previous) * 100;
		return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
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

			const response = {
				leads: {
					pending: leadsStats?.pending?.length || 0,
					approved: leadsStats?.approved?.length || 0,
					inReview: leadsStats?.review?.length || 0,
					declined: leadsStats?.declined?.length || 0,
					total: leadsStats?.total || 0,
					metrics: {
						leadTrends: {
							growth: this.calculateGrowth(leadsStats?.total || 0, leadsStats?.total - (leadsStats?.pending?.length || 0))
						}
					}
				},
				claims: {
					pending: claimsStats?.pending?.length || 0,
					approved: claimsStats?.approved?.length || 0,
					declined: claimsStats?.declined?.length || 0,
					paid: claimsStats?.paid?.length || 0,
					total: (claimsStats?.paid?.length || 0) + (claimsStats?.pending?.length || 0) + 
						   (claimsStats?.approved?.length || 0) + (claimsStats?.declined?.length || 0),
					totalValue: this.formatCurrency(Number(claimsStats?.totalValue || 0)),
					metrics: {
						valueGrowth: this.calculateGrowth(
							Number(claimsStats?.totalValue || 0),
							Number(previousClaims?.claims?.totalValue || 0)
						)
					}
				},
				tasks: {
					pending: tasksStats?.PENDING || 0,
					completed: tasksStats?.COMPLETED || 0,
					missed: tasksStats?.MISSED || 0,
					postponed: tasksStats?.POSTPONED || 0,
					total: Object.values(tasksStats || {}).reduce((acc: number, curr: number) => acc + curr, 0),
					metrics: {
						taskTrends: {
							growth: this.calculateGrowth(tasksStats?.COMPLETED || 0, tasksStats?.PENDING || 0)
						}
					}
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
						grossQuotationValue: this.formatCurrency(Number(ordersStats?.quotations?.metrics?.grossQuotationValue || 0)),
						averageQuotationValue: this.formatCurrency(Number(ordersStats?.quotations?.metrics?.averageQuotationValue || 0)),
						quotationTrends: {
							growth: this.calculateGrowth(
								ordersStats?.quotations?.metrics?.totalQuotations || 0,
								previousQuotations?.stats?.quotations?.metrics?.totalQuotations || 0
							)
						}
					}
				},
				attendance: {
					attendance: attendanceStats?.metrics?.attendancePercentage || 0,
					present: attendanceStats?.metrics?.totalPresent || 0,
					total: attendanceStats?.metrics?.totalEmployees || 0,
					metrics: {
						attendanceTrends: {
							growth: this.calculateGrowth(
								attendanceStats?.metrics?.attendancePercentage || 0,
								attendanceStats?.metrics?.attendancePercentage || 0
							)
						}
					}
				}
			};

			return response;
		} catch (error) {
			return this.handleError(error);
		}
	}

	@OnEvent('daily-report')
	async userDailyReport(reference?: string) {
		try {
			const date = new Date();

			const allData = await Promise.all([
				this.leadService.getLeadsForDate(date),
				this.journalService.getJournalsForDate(date),
				this.claimsService.getClaimsForDate(date),
				this.shopService.getQuotationsForDate(date),
				this.tasksService.getTasksForDate(date),
				this.attendanceService.getAttendanceForDate(date),
				reference ? this.rewardsService.getUserRewards(Number(reference)) : null,
				reference ? this.userService.findOne(Number(reference)) : null,
				reference ? this.trackingService.getDailyTracking(Number(reference), date) : null,
			]);

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
			] = allData;

			// Get previous day metrics for comparison
			const previousDay = new Date(date);
			previousDay.setDate(previousDay.getDate() - 1);
			const previousDayStats = await this.shopService.getQuotationsForDate(previousDay);
			const previousDayQuotations = previousDayStats?.stats?.quotations?.metrics?.totalQuotations || 0;
			const previousDayRevenue = Number(previousDayStats?.stats?.quotations?.metrics?.grossQuotationValue) || 0;

			const { reportMetadata, emailData } = this.formatReportData(
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
				description: `Daily report for the date ${new Date()}`,
				type: ReportType.DAILY,
				metadata: reportMetadata,
				owner: userData?.user,
				branch: userData?.user?.branch,
			});

			await this.reportRepository.save(report);

			// Send notification
			const notification = {
				type: NotificationType.USER,
				title: 'Daily Report Generated',
				message: `Your daily activity report for ${new Date().toLocaleDateString()} has been generated`,
				status: NotificationStatus.UNREAD,
				owner: userData?.user,
			};

			const recipients = [AccessLevel.USER];
			this.eventEmitter.emit('send.notification', notification, recipients);

			// Send email only if user has email
			if (userData?.user?.email) {
				const emailTemplate: DailyReportData = {
					name: userData.user.username,
					date: `${new Date()}`,
					...emailData,
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
		]);

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
		const [currentPeriod, previousPeriod] = await Promise.all([
			this.getPeriodMetrics(startDate, endDate, params),
			this.getPeriodMetrics(subMonths(startDate, 1), subMonths(endDate, 1), params),
		]);

		const claimsData = await this.claimsService.getClaimsReport({
			createdAt: { gte: startDate, lte: endDate },
		});
		const quotationsData = await this.shopService.getQuotationsReport({
			createdAt: { gte: startDate, lte: endDate },
		});

		// Calculate claims metrics
		const claimsBreakdown = claimsData.metrics.categoryBreakdown;
		const paidClaims = claimsBreakdown.reduce(
			(sum, cat) => (cat.category.toString() === 'PAID' ? sum + cat.count : sum),
			0,
		);
		const pendingClaims = claimsBreakdown.reduce(
			(sum, cat) => (cat.category.toString() === 'PENDING' ? sum + cat.count : sum),
			0,
		);
		const largestClaim = claimsData.metrics.topClaimants[0]?.totalValue
			? parseFloat(claimsData.metrics.topClaimants[0].totalValue.replace(/[^0-9.-]+/g, ''))
			: 0;

		// Calculate quotations metrics
		const acceptedQuotations = quotationsData.metrics.topProducts.reduce((sum, p) => sum + p.totalSold, 0);
		const totalQuotations = quotationsData.metrics.totalQuotations;
		const pendingQuotations = totalQuotations - acceptedQuotations;

		return {
			revenue: {
				current: currentPeriod.revenue,
				previous: previousPeriod.revenue,
				growth: this.calculateGrowth(currentPeriod.revenue, previousPeriod.revenue),
				trend: currentPeriod.revenue >= previousPeriod.revenue ? 'up' : 'down',
				breakdown: await this.getRevenueBreakdown(startDate, endDate),
			},
			claims: {
				total: claimsData.metrics.totalClaims,
				paid: paidClaims,
				pending: pendingClaims,
				average: parseFloat(claimsData.metrics.averageClaimValue.toString()),
				largestClaim,
				byType: claimsBreakdown.reduce((acc, cat) => {
					acc[cat.category.toString()] = cat.count;
					return acc;
				}, {} as Record<string, number>),
			},
			quotations: {
				total: totalQuotations,
				accepted: acceptedQuotations,
				pending: pendingQuotations,
				conversion: parseFloat(quotationsData.metrics.conversionRate.replace('%', '')),
				averageValue: parseFloat(quotationsData.metrics.averageQuotationValue.replace(/[^0-9.-]+/g, '')),
			},
		};
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
			const startDate = new Date(params.startDate);
			const endDate = new Date(params.endDate);

			const [financial, performance, comparison, trends] = await Promise.all([
				this.getFinancialMetrics(startDate, endDate, params),
				this.getPerformanceMetrics(startDate, endDate, params),
				this.getComparisonData(params),
				this.getTrendMetrics(startDate, endDate, params),
			]);

			const response: ReportResponse = {
				metadata: {
					generatedAt: new Date().toISOString(),
					period: `${formatDate(startDate, 'PP')} - ${formatDate(endDate, 'PP')}`,
					filters: params.filters as Record<string, unknown>,
				},
				financial,
				performance,
				comparison,
				trends,
				summary: {
					highlights: this.generateHighlights(financial, performance, comparison),
					recommendations: this.generateRecommendations(financial, performance, trends),
				},
			};

			// Handle different output formats
			if (params.visualization?.format === ReportFormat.PDF) {
				return response; // TODO: Implement PDF generation
			} else if (params.visualization?.format === ReportFormat.EXCEL) {
				return response; // TODO: Implement Excel generation
			}

			return response;
		} catch (error) {
			this.logger.error('Error generating report:', error);
			throw new Error('Failed to generate report');
		}
	}

	private async getRevenueBreakdown(
		startDate: Date,
		endDate: Date,
	): Promise<Array<{ category: string; value: number; percentage: number }>> {
		const quotationsData = await this.shopService.getQuotationsReport({
			createdAt: { gte: startDate, lte: endDate },
		});

		const totalRevenue = Number(quotationsData?.metrics?.grossQuotationValue || 0);
		const categories = quotationsData?.metrics?.topProducts || [];

		return categories.map((product) => ({
			category: product.productName,
			value: Number(product.totalValue || 0),
			percentage: (Number(product.totalValue || 0) / totalRevenue) * 100,
		}));
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
		// TODO: Implement daily patterns calculation
		return {
			Monday: 100,
			Tuesday: 120,
			Wednesday: 115,
			Thursday: 125,
			Friday: 90,
		};
	}

	private calculateWeeklyPatterns(startDate: Date, endDate: Date): Record<string, number> {
		// TODO: Implement weekly patterns calculation
		return {
			'Week 1': 450,
			'Week 2': 480,
			'Week 3': 520,
			'Week 4': 490,
		};
	}

	private calculateMonthlyPatterns(startDate: Date, endDate: Date): Record<string, number> {
		// TODO: Implement monthly patterns calculation
		return {
			Jan: 1200,
			Feb: 1300,
			Mar: 1450,
			Apr: 1380,
		};
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
}
