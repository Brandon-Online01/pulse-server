import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ReportsService {
	private readonly currencyLocale: string;
	private readonly currencyCode: string;
	private readonly currencySymbol: string;

	constructor(
		@InjectRepository(Report)
		private readonly reportRepository: Repository<Report>,
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
			currency: this.currencyCode
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
			statusCode: error?.status || 500
		}
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
				declined: leadsStats?.declined || []
			},
			journals: journalsStats || [],
			claims: {
				paid: claimsStats?.paid || [],
				pending: claimsStats?.pending || [],
				approved: claimsStats?.approved || [],
				declined: claimsStats?.declined || [],
				totalValue: this.formatCurrency(claimsStats?.totalValue || 0)
			},
			tasks: tasksTotal || 0,
			attendance: sortedAttendance.length > 0 ? {
				totalHours: attendanceHours,
				startTime: firstCheckIn.checkIn.toLocaleTimeString(),
				endTime: lastCheckOut.checkOut?.toLocaleTimeString(),
				duration: `${Math.floor(attendanceHours)}h ${Math.round((attendanceHours % 1) * 60)}m`,
				status: lastCheckOut.status,
				checkInLocation: firstCheckIn.checkInLatitude && firstCheckIn.checkInLongitude ? {
					latitude: firstCheckIn.checkInLatitude,
					longitude: firstCheckIn.checkInLongitude,
					notes: firstCheckIn.checkInNotes || '',
				} : undefined,
				checkOutLocation: lastCheckOut.checkOutLatitude && lastCheckOut.checkOutLongitude ? {
					latitude: lastCheckOut.checkOutLatitude,
					longitude: lastCheckOut.checkOutLongitude,
					notes: lastCheckOut.checkOutNotes || '',
				} : undefined,
				verifiedAt: firstCheckIn.verifiedAt?.toISOString(),
				verifiedBy: firstCheckIn.verifiedBy,
			} : undefined,
			quotations: {
				totalQuotations: currentQuotations,
				grossQuotationValue: this.formatCurrency(currentRevenue),
				averageQuotationValue: this.formatCurrency(currentQuotations > 0 ? currentRevenue / currentQuotations : 0),
				growth: this.calculateGrowth(currentQuotations, previousDayQuotations),
				revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
			},
			tracking: trackingData ? {
				totalDistance: trackingData?.totalDistance,
				locationAnalysis: {
					timeSpentByLocation: trackingData?.locationAnalysis?.timeSpentByLocation || {},
					averageTimePerLocation: trackingData?.locationAnalysis?.averageTimePerLocation || 0
				}
			} : null,
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
					(leadsStats?.total || 0) - (leadsStats?.pending?.length || 0)
				),
				userSpecific: {
					todayLeads: leadsStats?.pending?.length || 0,
					todayClaims: claimsStats?.pending?.length || 0,
					todayTasks: tasksTotal || 0,
					todayQuotations: currentQuotations,
					hoursWorked: attendanceHours,
				}
			}
		};

		return {
			reportMetadata: commonData,
			emailData: {
				metrics: {
					...commonData.metrics,
					xp: commonData.xp,
					attendance: commonData.attendance,
					quotationGrowth: commonData.quotations.growth,
					revenueGrowth: commonData.quotations.revenueGrowth
				},
				tracking: trackingData ? {
					totalDistance: trackingData?.totalDistance,
					locations: Object.entries(trackingData.locationAnalysis.timeSpentByLocation || {}).map(([address, minutes]) => ({
						address,
						timeSpent: `${Math.round(Number(minutes))} minutes`
					})),
					averageTimePerLocation: `${Math.round(trackingData.locationAnalysis.averageTimePerLocation || 0)} minutes`
				} : undefined
			}
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
				this.attendanceService.getMonthlyAttendanceStats()
			]);

			const [
				{ leads: leadsStats },
				{ journals: journalsStats },
				{ claims: claimsStats },
				{ stats: ordersStats },
				{ byStatus: tasksStats },
				{ stats: attendanceStats }
			] = allData;

			const response = {
				leads: {
					pending: leadsStats?.pending?.length,
					approved: leadsStats?.approved?.length,
					inReview: leadsStats?.review?.length,
					declined: leadsStats?.declined?.length,
					total: leadsStats?.total
				},
				journals: {
					total: journalsStats?.length,
				},
				claims: {
					pending: claimsStats?.pending?.length || 0,
					approved: claimsStats?.approved?.length || 0,
					declined: claimsStats?.declined?.length || 0,
					paid: claimsStats?.paid?.length || 0,
					totalValue: claimsStats?.totalValue || 0
				},
				tasks: {
					pending: tasksStats?.PENDING,
					completed: tasksStats?.COMPLETED,
					missed: tasksStats?.MISSED,
					postponed: tasksStats?.POSTPONED,
					total: Object.values(tasksStats || {}).reduce((acc: number, curr: number) => acc + curr, 0)
				},
				attendance: {
					attendance: attendanceStats?.metrics?.attendancePercentage,
					present: attendanceStats?.metrics?.totalPresent,
					total: attendanceStats?.metrics?.totalEmployees
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
						averageQuotationValue: ordersStats?.quotations?.metrics?.averageQuotationValue || 0
					}
				},
			}

			return response
		} catch (error) {
			return this.handleError(error)
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
				reference ? this.trackingService.getDailyTracking(Number(reference), date) : null
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
				{ data: trackingData }
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
				previousDayRevenue
			);

			// Create report record
			const report = this.reportRepository.create({
				title: 'Daily Report',
				description: `Daily report for the date ${new Date()}`,
				type: ReportType.DAILY,
				metadata: reportMetadata,
				owner: userData?.user,
				branch: userData?.user?.branch
			});

			await this.reportRepository.save(report);

			// Send notification
			const notification = {
				type: NotificationType.USER,
				title: 'Daily Report Generated',
				message: `Your daily activity report for ${new Date().toLocaleDateString()} has been generated`,
				status: NotificationStatus.UNREAD,
				owner: userData?.user
			};

			const recipients = [AccessLevel.USER];
			this.eventEmitter.emit('send.notification', notification, recipients);

			// Send email only if user has email
			if (userData?.user?.email) {
				const emailTemplate: DailyReportData = {
					name: userData.user.username,
					date: `${new Date()}`,
					...emailData
				};

				this.eventEmitter.emit('send.email', EmailType.DAILY_REPORT, [userData.user.email], emailTemplate);
			}

			return report;
		} catch (error) {
			return this.handleError(error);
		}
	}
}
