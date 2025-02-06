import { Injectable, NotFoundException } from '@nestjs/common';
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
import { GenerateReportDto } from '../reports/dto/generate-report.dto';
import { differenceInMinutes } from 'date-fns';
import { CheckIn } from '../check-ins/entities/check-in.entity';

interface Location {
	address: string;
	coordinates?: { lat: number; lng: number };
}

@Injectable()
export class ReportsService {
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

			const response = {
				leads: {
					pending: leadsStats?.pending?.length,
					approved: leadsStats?.approved?.length,
					inReview: leadsStats?.review?.length,
					declined: leadsStats?.declined?.length,
					total: leadsStats?.total,
				},
				journals: {
					total: journalsStats?.length,
				},
				claims: {
					pending: claimsStats?.pending?.length || 0,
					approved: claimsStats?.approved?.length || 0,
					declined: claimsStats?.declined?.length || 0,
					paid: claimsStats?.paid?.length || 0,
					totalValue: claimsStats?.totalValue || 0,
				},
				tasks: {
					pending: tasksStats?.PENDING,
					completed: tasksStats?.COMPLETED,
					missed: tasksStats?.MISSED,
					postponed: tasksStats?.POSTPONED,
					total: Object.values(tasksStats || {}).reduce((acc: number, curr: number) => acc + curr, 0),
				},
				attendance: {
					attendance: attendanceStats?.metrics?.attendancePercentage,
					present: attendanceStats?.metrics?.totalPresent,
					total: attendanceStats?.metrics?.totalEmployees,
				},
				orders: {
					pending: ordersStats?.quotations?.pending?.length,
					processing: ordersStats?.quotations?.processing?.length,
					completed: ordersStats?.quotations?.completed?.length,
					cancelled: ordersStats?.quotations?.cancelled?.length,
					postponed: ordersStats?.quotations?.postponed?.length,
					rejected: ordersStats?.quotations?.rejected?.length,
					approved: ordersStats?.quotations?.approved?.length,
					metrics: {
						totalQuotations: ordersStats?.quotations?.metrics?.totalQuotations,
						grossQuotationValue: ordersStats?.quotations?.metrics?.grossQuotationValue || 0,
						averageQuotationValue: ordersStats?.quotations?.metrics?.averageQuotationValue || 0,
					},
				},
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

	async generateReport(params: GenerateReportDto) {
		try {
			// Log the raw incoming DTO
			console.log('=== REPORT GENERATION START ===');
			console.log('1. Raw DTO received:', {
				params,
				paramTypes: {
					startDate: typeof params.startDate,
					endDate: typeof params.endDate,
					period: typeof params.period,
					type: typeof params.type
				}
			});

			const { startDate, endDate, period, type } = params;
			
			// Log the destructured values
			console.log('2. Destructured values:', {
				startDate,
				endDate,
				period,
				type,
				startDateType: typeof startDate,
				endDateType: typeof endDate
			});

			// Parse dates and log results
			const currentStartDate = new Date(startDate);
			const currentEndDate = new Date(endDate);

			console.log('3. Parsed dates:', {
				currentStartDate,
				currentEndDate,
				isStartDateValid: !isNaN(currentStartDate.getTime()),
				isEndDateValid: !isNaN(currentEndDate.getTime()),
				startDateTimestamp: currentStartDate.getTime(),
				endDateTimestamp: currentEndDate.getTime()
			});

			// Validate dates
			if (isNaN(currentStartDate.getTime()) || isNaN(currentEndDate.getTime())) {
				console.error('4. Date validation failed:', {
					startDateValid: !isNaN(currentStartDate.getTime()),
					endDateValid: !isNaN(currentEndDate.getTime()),
					startDateString: startDate,
					endDateString: endDate
				});
				throw new Error('Invalid date format provided');
			}

			// Log period validation
			console.log('5. Period validation:', {
				providedPeriod: period,
				periodLowerCase: period.toLowerCase(),
				isValidPeriod: ['daily', 'weekly', 'monthly'].includes(period.toLowerCase())
			});

			// Calculate previous period for comparison
			const previousStartDate = new Date(currentStartDate);
			const previousEndDate = new Date(currentStartDate);

			// Adjust previous period based on selected period
			switch (period.toLowerCase()) {
				case 'daily':
					previousStartDate.setDate(previousStartDate.getDate() - 1);
					previousEndDate.setDate(previousEndDate.getDate() - 1);
					break;
				case 'weekly':
					previousStartDate.setDate(previousStartDate.getDate() - 7);
					previousEndDate.setDate(previousEndDate.getDate() - 7);
					break;
				case 'monthly':
					previousStartDate.setMonth(previousStartDate.getMonth() - 1);
					previousEndDate.setMonth(previousEndDate.getMonth() - 1);
					break;
				default:
					console.error('Invalid period:', period);
					throw new Error('Invalid period specified');
			}

			// Log calculated comparison dates
			console.log('Comparison period dates:', {
				previousStartDate: previousStartDate.toISOString(),
				previousEndDate: previousEndDate.toISOString(),
				previousStartDateLocal: previousStartDate.toString(),
				previousEndDateLocal: previousEndDate.toString()
			});

			const dateFilter = {
				createdAt: {
					gte: currentStartDate,
					lte: currentEndDate
				}
			};

			const previousDateFilter = {
				createdAt: {
					gte: previousStartDate,
					lte: previousEndDate
				}
			};

			// Log the final filter objects
			console.log('Final date filters:', {
				current: JSON.stringify(dateFilter, null, 2),
				previous: JSON.stringify(previousDateFilter, null, 2)
			});

			const currentFilter = { ...dateFilter };
			const previousFilter = { ...previousDateFilter };

			// Log the type of report being generated
			console.log('Generating report for type:', type);

			let reportData: any = {};
			let title = '';
			let description = '';

			switch (type) {
				case ReportType.CLAIM:
					const [currentClaimsData, previousClaimsData] = await Promise.all([
						this.claimsService.getClaimsReport(currentFilter),
						this.claimsService.getClaimsReport(previousFilter),
					]);

					const currentTotalValue = currentClaimsData?.totalValue || 0;
					const previousTotalValue = previousClaimsData?.totalValue || 0;
					const valueGrowth = this.calculateGrowth(currentTotalValue, previousTotalValue);

					reportData = {
						total: currentClaimsData?.total || 0,
						paid: currentClaimsData?.paid || [],
						pending: currentClaimsData?.pending || [],
						approved: currentClaimsData?.approved || [],
						declined: currentClaimsData?.declined || [],
						totalValue: this.formatCurrency(currentTotalValue),
						metrics: {
							averageClaimValue: this.formatCurrency(currentClaimsData?.metrics?.averageClaimValue || 0),
							totalClaims: currentClaimsData?.metrics?.totalClaims || 0,
							approvalRate: currentClaimsData?.metrics?.approvalRate || '0%',
							processingTime: currentClaimsData?.metrics?.averageProcessingTime || '0 days',
							valueGrowth,
							categoryBreakdown: currentClaimsData?.metrics?.categoryBreakdown || {},
							topClaimants: currentClaimsData?.metrics?.topClaimants || [],
							claimTrends: {
								thisMonth: currentClaimsData?.metrics?.totalClaims || 0,
								lastMonth: previousClaimsData?.metrics?.totalClaims || 0,
								growth: this.calculateGrowth(
									currentClaimsData?.metrics?.totalClaims || 0,
									previousClaimsData?.metrics?.totalClaims || 0,
								),
							},
						},
					};
					title = 'Claims Report';
					description = `Claims report for period ${startDate} to ${endDate}`;
					break;

				case ReportType.QUOTATION:
					console.log('Fetching quotation reports with filters:', {
						currentFilter: JSON.stringify(currentFilter, null, 2),
						previousFilter: JSON.stringify(previousFilter, null, 2)
					});

					let [currentData, previousData] = await Promise.all([
						this.shopService.getQuotationsReport(currentFilter),
						this.shopService.getQuotationsReport(previousFilter)
					]);

					console.log('Raw quotation data received:', {
						current: JSON.stringify(currentData, null, 2),
						previous: JSON.stringify(previousData, null, 2)
					});

					const defaultData = {
						total: 0,
						pending: [],
						approved: [],
						rejected: [],
						metrics: {
							totalQuotations: 0,
							grossQuotationValue: '0',
							averageQuotationValue: '0',
							conversionRate: '0%',
							topProducts: [],
							leastSoldProducts: [],
							peakOrderTimes: [],
							averageBasketSize: 0,
							topShops: [],
						},
					};

					if (!currentData) {
						console.log('No current quotation data found');
						currentData = defaultData;
					}

					if (!previousData) {
						console.log('No previous quotation data found');
						previousData = defaultData;
					}

					reportData = {
						total: currentData?.total || 0,
						pending: currentData?.pending || [],
						approved: currentData?.approved || [],
						rejected: currentData?.rejected || [],
						metrics: {
							totalQuotations: currentData?.metrics?.totalQuotations || 0,
							grossQuotationValue: this.formatCurrency(
								Number(
									currentData?.metrics?.grossQuotationValue?.toString().replace(/[^0-9.-]+/g, ''),
								) || 0,
							),
							averageQuotationValue: this.formatCurrency(
								Number(
									currentData?.metrics?.averageQuotationValue?.toString().replace(/[^0-9.-]+/g, ''),
								) || 0,
							),
							conversionRate: currentData?.metrics?.conversionRate || '0%',
							quotationTrends: {
								thisMonth: currentData?.metrics?.totalQuotations || 0,
								lastMonth: previousData?.metrics?.totalQuotations || 0,
								growth: this.calculateGrowth(
									currentData?.metrics?.totalQuotations || 0,
									previousData?.metrics?.totalQuotations || 0,
								),
							},
							topProducts: currentData?.metrics?.topProducts || [],
							leastSoldProducts: currentData?.metrics?.leastSoldProducts || [],
							peakOrderTimes: currentData?.metrics?.peakOrderTimes || [],
							averageBasketSize: currentData?.metrics?.averageBasketSize || 0,
							topShops: currentData?.metrics?.topShops || [],
						},
					};
					title = 'Quotations Report';
					description = `Quotations report for period ${startDate} to ${endDate}`;
					break;

				case ReportType.LEAD:
					const [currentLeadsData, previousLeadsData] = await Promise.all([
						this.leadService.getLeadsReport(currentFilter),
						this.leadService.getLeadsReport(previousFilter),
					]);

					reportData = {
						total: currentLeadsData?.total || 0,
						review: currentLeadsData?.review || [],
						pending: currentLeadsData?.pending || [],
						approved: currentLeadsData?.approved || [],
						declined: currentLeadsData?.declined || [],
						metrics: {
							conversionRate: currentLeadsData?.metrics?.conversionRate || '0%',
							averageResponseTime: currentLeadsData?.metrics?.averageResponseTime || '0 hours',
							topSources: currentLeadsData?.metrics?.topSources || [],
							qualityScore: currentLeadsData?.metrics?.qualityScore || 0,
							leadTrends: {
								thisMonth: currentLeadsData?.total || 0,
								lastMonth: previousLeadsData?.total || 0,
								growth: this.calculateGrowth(
									currentLeadsData?.total || 0,
									previousLeadsData?.total || 0,
								),
							},
							sourceEffectiveness: currentLeadsData?.metrics?.sourceEffectiveness || {},
							geographicDistribution: currentLeadsData?.metrics?.geographicDistribution || {},
							leadQualityBySource: currentLeadsData?.metrics?.leadQualityBySource || {},
						},
					};
					title = 'Leads Report';
					description = `Leads report for period ${startDate} to ${endDate}`;
					break;

				case ReportType.TASK:
					const [currentTasksData, previousTasksData] = await Promise.all([
						this.tasksService.getTasksReport(currentFilter),
						this.tasksService.getTasksReport(previousFilter),
					]);

					reportData = {
						total: currentTasksData?.total || 0,
						pending: currentTasksData?.pending || [],
						inProgress: currentTasksData?.inProgress || [],
						completed: currentTasksData?.completed || [],
						overdue: currentTasksData?.overdue || [],
						metrics: {
							completionRate: currentTasksData?.metrics?.completionRate || '0%',
							averageCompletionTime: currentTasksData?.metrics?.averageCompletionTime || '0 hours',
							overdueRate: currentTasksData?.metrics?.overdueRate || '0%',
							taskDistribution: currentTasksData?.metrics?.taskDistribution || {},
							taskTrends: {
								thisMonth: currentTasksData?.total || 0,
								lastMonth: previousTasksData?.total || 0,
								growth: this.calculateGrowth(
									currentTasksData?.total || 0,
									previousTasksData?.total || 0,
								),
							},
							incompletionReasons: currentTasksData?.metrics?.incompletionReasons || [],
							clientCompletionRates: currentTasksData?.metrics?.clientCompletionRates || [],
							taskPriorityDistribution: currentTasksData?.metrics?.taskPriorityDistribution || {},
							assigneePerformance: currentTasksData?.metrics?.assigneePerformance || [],
						},
					};
					title = 'Tasks Report';
					description = `Tasks report for period ${startDate} to ${endDate}`;
					break;

				default:
					throw new Error('Invalid report type');
			}

			console.log('Creating report with data:', { title, description, type, reportData });

			// Create report record
			const report = this.reportRepository.create({
				title,
				description,
				type,
				metadata: {
					period,
					startDate: currentStartDate.toISOString(),
					endDate: currentEndDate.toISOString(),
					generatedAt: new Date().toISOString(),
					...reportData,
				},
			});

			const savedReport = await this.reportRepository.save(report);
			console.log('Report saved successfully:', savedReport.uid);

			return savedReport;
		} catch (error) {
			console.error('Error generating report:', {
				error,
				errorMessage: error.message,
				errorStack: error.stack,
				errorName: error.name,
				errorResponse: error.response?.data,
				params: JSON.stringify(params, null, 2)
			});

			// Check for specific error types
			if (error instanceof TypeError) {
				return this.handleError({
					message: 'Invalid data type in report generation',
					status: 400,
					details: error.message
				});
			}

			if (error.name === 'EntityNotFoundError') {
				return this.handleError({
					message: 'Required data not found',
					status: 404,
					details: error.message
				});
			}

			return this.handleError({
				message: 'Failed to generate report: ' + error.message,
				status: 500,
				details: error.stack
			});
		}
	}

	// Helper method to calculate growth percentage
	private calculateGrowthPercentage(current: number, previous: number): string {
		if (previous === 0) return '+100%';
		const growth = ((current - previous) / previous) * 100;
		return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
	}

	async getCheckInsReport(filter: any) {
		try {
			const checkIns = await this.checkInRepository.find({
				where: filter,
				relations: ['owner', 'branch', 'client'],
			});

			if (!checkIns) {
				throw new NotFoundException('No check-ins found for the specified period');
			}

			const totalCheckIns = checkIns.length;
			const totalDuration = checkIns.reduce((sum, checkIn) => {
				if (checkIn.checkOutTime) {
					const duration = differenceInMinutes(new Date(checkIn.checkOutTime), new Date(checkIn.checkInTime));
					return sum + duration;
				}
				return sum;
			}, 0);

			const averageDuration = totalCheckIns > 0 ? totalDuration / totalCheckIns : 0;
			const employeeStats = this.analyzeEmployeeAttendance(checkIns);
			const locationStats = this.analyzeCheckInLocations(checkIns);
			const timeStats = this.analyzeCheckInTimes(checkIns);

			return {
				totalCheckIns,
				totalDurationMinutes: totalDuration,
				averageDurationMinutes: Math.round(averageDuration),
				metrics: {
					employeeStats,
					locationStats,
					timeStats,
					completionRate: `${((checkIns.filter((c) => c.checkOutTime).length / totalCheckIns) * 100).toFixed(
						1,
					)}%`,
				},
			};
		} catch (error) {
			return null;
		}
	}

	private getLocationString(checkInLocation: string | Location | null): string {
		if (!checkInLocation) return 'Unknown';
		if (typeof checkInLocation === 'string') return checkInLocation;
		return checkInLocation.address || 'Unknown';
	}

	private analyzeEmployeeAttendance(checkIns: CheckIn[]): Array<{
		employeeId: number;
		employeeName: string;
		totalCheckIns: number;
		averageDuration: number;
		completedCheckIns: number;
		mostFrequentLocation: string;
	}> {
		const employeeStats = new Map<
			number,
			{
				name: string;
				checkIns: number;
				totalDuration: number;
				completedCheckIns: number;
				locations: Record<string, number>;
			}
		>();

		checkIns.forEach((checkIn) => {
			if (!employeeStats.has(checkIn.owner.uid)) {
				employeeStats.set(checkIn.owner.uid, {
					name: checkIn.owner.username,
					checkIns: 0,
					totalDuration: 0,
					completedCheckIns: 0,
					locations: {},
				});
			}

			const stats = employeeStats.get(checkIn.owner.uid);
			stats.checkIns++;

			if (checkIn.checkOutTime) {
				stats.completedCheckIns++;
				stats.totalDuration += differenceInMinutes(
					new Date(checkIn.checkOutTime),
					new Date(checkIn.checkInTime),
				);
			}

			const location = this.getLocationString(checkIn.checkInLocation);
			stats.locations[location] = (stats.locations[location] || 0) + 1;
		});

		return Array.from(employeeStats.entries())
			.map(([employeeId, stats]) => ({
				employeeId,
				employeeName: stats.name,
				totalCheckIns: stats.checkIns,
				averageDuration: Math.round(stats.totalDuration / stats.completedCheckIns || 0),
				completedCheckIns: stats.completedCheckIns,
				mostFrequentLocation: Object.entries(stats.locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
			}))
			.sort((a, b) => b.totalCheckIns - a.totalCheckIns);
	}

	private analyzeCheckInLocations(checkIns: CheckIn[]): Array<{
		location: string;
		totalCheckIns: number;
		uniqueEmployees: number;
		averageDuration: number;
	}> {
		const locationStats = new Map<
			string,
			{
				checkIns: number;
				employees: Set<number>;
				totalDuration: number;
				completedCheckIns: number;
			}
		>();

		checkIns.forEach((checkIn) => {
			const location = this.getLocationString(checkIn.checkInLocation);

			if (!locationStats.has(location)) {
				locationStats.set(location, {
					checkIns: 0,
					employees: new Set(),
					totalDuration: 0,
					completedCheckIns: 0,
				});
			}

			const stats = locationStats.get(location);
			stats.checkIns++;
			stats.employees.add(checkIn.owner.uid);

			if (checkIn.checkOutTime) {
				stats.completedCheckIns++;
				stats.totalDuration += differenceInMinutes(
					new Date(checkIn.checkOutTime),
					new Date(checkIn.checkInTime),
				);
			}
		});

		return Array.from(locationStats.entries())
			.map(([location, stats]) => ({
				location,
				totalCheckIns: stats.checkIns,
				uniqueEmployees: stats.employees.size,
				averageDuration: Math.round(stats.totalDuration / stats.completedCheckIns || 0),
			}))
			.sort((a, b) => b.totalCheckIns - a.totalCheckIns);
	}

	private analyzeCheckInTimes(checkIns: CheckIn[]): {
		peakHours: Array<{ hour: number; count: number }>;
		averageStartTime: string;
		averageEndTime: string;
		averageDuration: number;
	} {
		const hourCounts = new Array(24).fill(0);
		let totalStartMinutes = 0;
		let totalEndMinutes = 0;
		let totalDuration = 0;
		let completedCheckIns = 0;

		checkIns.forEach((checkIn) => {
			const startHour = new Date(checkIn.checkInTime).getHours();
			hourCounts[startHour]++;

			const startMinutes = startHour * 60 + new Date(checkIn.checkInTime).getMinutes();
			totalStartMinutes += startMinutes;

			if (checkIn.checkOutTime) {
				completedCheckIns++;
				const endHour = new Date(checkIn.checkOutTime).getHours();
				const endMinutes = endHour * 60 + new Date(checkIn.checkOutTime).getMinutes();
				totalEndMinutes += endMinutes;
				totalDuration += differenceInMinutes(new Date(checkIn.checkOutTime), new Date(checkIn.checkInTime));
			}
		});

		const avgStartMinutes = Math.round(totalStartMinutes / checkIns.length);
		const avgEndMinutes = Math.round(totalEndMinutes / completedCheckIns);

		return {
			peakHours: hourCounts
				.map((count, hour) => ({ hour, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5),
			averageStartTime: `${Math.floor(avgStartMinutes / 60)}:${String(avgStartMinutes % 60).padStart(2, '0')}`,
			averageEndTime: `${Math.floor(avgEndMinutes / 60)}:${String(avgEndMinutes % 60).padStart(2, '0')}`,
			averageDuration: Math.round(totalDuration / completedCheckIns),
		};
	}

	// Flash Report Functions
	async getDailyFlashReport() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const filter = {
			createdAt: {
				gte: today,
				lt: tomorrow,
			},
		};

		const [salesData, attendanceData] = await Promise.all([
			this.shopService.getQuotationsReport(filter),
			this.getCheckInsReport(filter),
		]);

		return {
			date: today.toISOString().split('T')[0],
			sales: {
				totalQuotations: salesData?.total || 0,
				totalValue: salesData?.metrics?.grossQuotationValue || '0',
				conversionRate: salesData?.metrics?.conversionRate || '0%',
				topProducts: salesData?.metrics?.topProducts?.slice(0, 3) || [],
			},
			attendance: {
				totalCheckIns: attendanceData?.totalCheckIns || 0,
				averageDuration: attendanceData?.averageDurationMinutes || 0,
				completionRate: attendanceData?.metrics?.completionRate || '0%',
				presentEmployees: attendanceData?.metrics?.employeeStats?.length || 0,
			},
		};
	}

	async getWeeklyJournalFlashReport() {
		const today = new Date();
		const weekStart = new Date(today);
		weekStart.setDate(weekStart.getDate() - 7);
		weekStart.setHours(0, 0, 0, 0);

		const filter = {
			createdAt: {
				gte: weekStart,
				lte: today,
			},
		};

		const journalData = await this.journalService.getJournalsReport(filter);

		return {
			period: `${weekStart.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`,
			totalJournals: journalData?.metrics?.totalEntries || 0,
			completionRate: journalData?.metrics?.completionRate || '0%',
			topContributors: journalData?.metrics?.topCategories?.slice(0, 3) || [],
			categoryBreakdown: journalData?.metrics?.topCategories || {},
		};
	}

	async getMonthlyClaimsFlashReport() {
		const today = new Date();
		const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
		const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
		const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

		const [currentMonthData, lastMonthData] = await Promise.all([
			this.claimsService.getClaimsReport({
				createdAt: {
					gte: monthStart,
					lte: today,
				},
			}),
			this.claimsService.getClaimsReport({
				createdAt: {
					gte: lastMonthStart,
					lte: lastMonthEnd,
				},
			}),
		]);

		const currentTotal = currentMonthData?.total || 0;
		const lastTotal = lastMonthData?.total || 0;
		const growth = this.calculateGrowthPercentage(currentTotal, lastTotal);

		return {
			period: monthStart.toISOString().split('T')[0],
			currentMonth: {
				totalClaims: currentTotal,
				totalValue: currentMonthData?.totalValue || 0,
				approvalRate: currentMonthData?.metrics?.approvalRate || '0%',
				averageValue: currentMonthData?.metrics?.averageClaimValue || 0,
			},
			comparison: {
				claimsGrowth: growth,
				valueGrowth: this.calculateGrowthPercentage(
					currentMonthData?.totalValue || 0,
					lastMonthData?.totalValue || 0,
				),
			},
			topCategories: currentMonthData?.metrics?.categoryBreakdown?.slice(0, 3) || [],
		};
	}
}
