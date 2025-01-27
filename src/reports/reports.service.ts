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

	async managerDailyReport() {
		try {
			const allData = await Promise.all([
				this.leadService.getLeadsForDate(new Date()),
				this.journalService.getJournalsForDate(new Date()),
				this.claimsService.getClaimsForDate(new Date()),
				this.shopService.getOrdersForDate(new Date()),
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
					total: Object?.values(tasksStats)?.reduce((acc, curr) => acc + curr, 0)
				},
				attendance: {
					attendance: attendanceStats?.metrics?.attendancePercentage,
					present: attendanceStats?.metrics?.totalPresent,
					total: attendanceStats?.metrics?.totalEmployees
				},
				orders: {
					pending: ordersStats?.orders?.pending?.length,
					processing: ordersStats?.orders?.processing?.length,
					completed: ordersStats?.orders?.completed?.length,
					cancelled: ordersStats?.orders?.cancelled?.length,
					postponed: ordersStats?.orders?.postponed?.length,
					outForDelivery: ordersStats?.orders?.outForDelivery?.length,
					delivered: ordersStats?.orders?.delivered?.length,
					rejected: ordersStats?.orders?.rejected?.length,
					approved: ordersStats?.orders?.approved?.length,
					metrics: {
						totalOrders: ordersStats?.orders?.metrics?.totalOrders,
						grossOrderValue: ordersStats?.orders?.metrics?.grossOrderValue || 0,
						averageOrderValue: ordersStats?.orders?.metrics?.averageOrderValue || 0
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
				this.shopService.getOrdersForDate(date),
				this.tasksService.getTasksForDate(date),
				this.attendanceService.getAttendanceForDate(date),
				this.newsService.findAll(),
				this.rewardsService.getUserRewards(Number(reference)),
				reference ? this.userService.findOne(Number(reference)) : null,
				this.trackingService.getDailyTracking(Number(reference), date)
			]);

			const [
				{ leads: leadsStats },
				{ journals: journalsStats },
				{ claims: claimsStats },
				{ stats: ordersStats },
				{ total: tasksTotal },
				{ totalHours: attendanceHours, activeShifts, attendanceRecords },
				{ data: newsItems },
				{ rewards: userRewards },
				userData,
				{ data: trackingData }
			] = allData;

			// Create report record with tracking data
			const report = this.reportRepository.create({
				title: 'Daily Report',
				description: `Daily report for the date ${new Date()}`,
				type: ReportType.DAILY,
				metadata: {
					leads: leadsStats,
					journals: journalsStats,
					claims: claimsStats,
					tasks: tasksTotal,
					attendance: { totalHours: attendanceHours, activeShifts, attendanceRecords },
					orders: ordersStats?.orders,
					news: newsItems,
					rewards: userRewards,
					tracking: trackingData ? {
						totalDistance: trackingData.totalDistance,
						locationAnalysis: trackingData.locationAnalysis
					} : null
				},
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

			// Send email only to the user
			if (userData?.user?.email) {
				// Get previous day metrics for comparison
				const previousDayOrders = ordersStats?.orders?.metrics?.totalOrders || 0;
				const previousDayRevenue = Number(ordersStats?.orders?.metrics?.grossOrderValue?.replace(/[^0-9.-]+/g, '')) || 0;

				// Calculate current day metrics
				const currentRevenue = Number(ordersStats?.orders?.metrics?.grossOrderValue) || 0;
				const currentOrders = ordersStats?.orders?.metrics?.totalOrders || 0;

				// Format metrics for email
				const emailData: DailyReportData = {
					name: userData.user.username,
					date: new Date(),
					metrics: {
						xp: {
							level: userRewards?.rewards?.rank || 1,
							currentXP: userRewards?.rewards?.totalXP || 0,
							todayXP: userRewards?.rewards?.todayXP || 0,
						},
						attendance: attendanceRecords[0] ? {
							startTime: attendanceRecords[0].checkIn.toLocaleTimeString(),
							endTime: attendanceRecords[0].checkOut?.toLocaleTimeString(),
							totalHours: attendanceHours,
							duration: attendanceRecords[0].duration,
							status: attendanceRecords[0].status,
							checkInLocation: attendanceRecords[0].checkInLatitude && attendanceRecords[0].checkInLongitude ? {
								latitude: attendanceRecords[0].checkInLatitude,
								longitude: attendanceRecords[0].checkInLongitude,
								notes: attendanceRecords[0].checkInNotes,
							} : undefined,
							checkOutLocation: attendanceRecords[0].checkOutLatitude && attendanceRecords[0].checkOutLongitude ? {
								latitude: attendanceRecords[0].checkOutLatitude,
								longitude: attendanceRecords[0].checkOutLongitude,
								notes: attendanceRecords[0].checkOutNotes,
							} : undefined,
							verifiedAt: attendanceRecords[0].verifiedAt?.toISOString(),
							verifiedBy: attendanceRecords[0].verifiedBy,
						} : undefined,
						totalOrders: currentOrders,
						totalRevenue: this.formatCurrency(currentRevenue),
						newCustomers: leadsStats?.total || 0,
						orderGrowth: this.calculateGrowth(currentOrders, previousDayOrders),
						revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
						customerGrowth: this.calculateGrowth(
							leadsStats?.total || 0,
							(leadsStats?.total || 0) - (leadsStats?.pending?.length || 0)
						),
						userSpecific: {
							todayLeads: leadsStats?.pending?.length || 0,
							todayClaims: claimsStats?.pending?.length || 0,
							todayTasks: tasksTotal || 0,
							todayOrders: currentOrders,
							hoursWorked: attendanceHours,
						},
					},
					tracking: trackingData ? {
						totalDistance: trackingData?.totalDistance,
						locations: Object.entries(trackingData.locationAnalysis.timeSpentByLocation).map(([address, minutes]) => ({
							address,
							timeSpent: `${Math.round(Number(minutes))} minutes`
						})),
						averageTimePerLocation: `${Math.round(trackingData.locationAnalysis.averageTimePerLocation)} minutes`
					} : undefined
				};

				// Send email only to the user
				this.eventEmitter.emit('send.email', EmailType.DAILY_REPORT, [userData.user.email], emailData);
			}

			return report;
		} catch (error) {
			return this.handleError(error);
		}
	}
}
