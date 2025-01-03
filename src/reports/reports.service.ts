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

@Injectable()
export class ReportsService {
	private readonly logger = new Logger(ReportsService.name);
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
		private readonly eventEmitter: EventEmitter2,
		private readonly configService: ConfigService,
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
					pending: tasksStats?.pending,
					completed: tasksStats?.completed,
					missed: tasksStats?.missed,
					postponed: tasksStats?.postponed,
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
				reference ? this.userService.findOne(reference.toString()) : null
			]);

			const [
				{ leads: leadsStats },
				{ journals: journalsStats },
				{ claims: claimsStats },
				{ stats: ordersStats },
				{ total: tasksTotal },
				{ totalHours: attendanceHours },
				{ data: newsItems },
				userData
			] = allData;

			//overview report data
			const response = {
				date: new Date().toISOString(),
				overview: {
					leads: {
						pending: leadsStats?.pending?.length || 0,
						approved: leadsStats?.approved?.length || 0,
						inReview: leadsStats?.review?.length || 0,
						declined: leadsStats?.declined?.length || 0,
						total: leadsStats?.total || 0
					},
					journals: {
						total: journalsStats?.length || 0,
					},
					claims: {
						pending: claimsStats?.pending?.length || 0,
						approved: claimsStats?.approved?.length || 0,
						declined: claimsStats?.declined?.length || 0,
						paid: claimsStats?.paid?.length || 0,
						totalValue: claimsStats?.totalValue || 0
					},
					tasks: {
						total: tasksTotal || 0,
						pending: tasksTotal || 0 // Using total as pending for now
					},
					attendance: {
						hoursWorked: attendanceHours || 0
					},
					orders: {
						pending: ordersStats?.orders?.pending?.length || 0,
						processing: ordersStats?.orders?.processing?.length || 0,
						completed: ordersStats?.orders?.completed?.length || 0,
						metrics: ordersStats?.orders?.metrics || {
							totalOrders: 0,
							grossOrderValue: '0',
							averageOrderValue: '0'
						}
					},
					news: {
						total: newsItems?.filter(item =>
							new Date(item.createdAt).toDateString() === new Date().toDateString()
						).length || 0
					}
				}
			};

			// User specific report data
			if (reference && userData?.user) {
				const userSpecificData = await Promise.all([
					this.leadService.leadsByUser(Number(userData.user.uid)),
					this.claimsService.claimsByUser(Number(userData.user.uid)),
					this.tasksService.tasksByUser(Number(userData.user.uid)),
					this.shopService.getOrdersByUser(Number(userData.user.uid)),
					this.attendanceService.getCurrentShiftHours(Number(userData.user.uid))
				]);

				const [
					userLeads,
					userClaims,
					userTasks,
					userOrders,
					currentShiftHours
				] = userSpecificData;

				response['userSpecific'] = {
					user: {
						uid: Number(userData.user.uid),
						name: userData.user.username,
					},
					todaysActivity: {
						leads: userLeads?.leads?.filter(lead =>
							new Date(lead?.createdAt).toDateString() === new Date().toDateString()
						).length || 0,
						claims: userClaims?.claims?.filter(claim =>
							new Date(claim?.createdAt).toDateString() === new Date().toDateString()
						).length || 0,
						tasks: userTasks?.tasks?.filter(task =>
							new Date(task?.createdAt).toDateString() === new Date().toDateString()
						).length || 0,
						orders: userOrders?.orders?.filter(order =>
							new Date(order?.orderDate).toDateString() === new Date().toDateString()
						).length || 0,
						currentShiftHours: currentShiftHours || 0
					}
				};
			}

			const report = this.reportRepository.create({
				title: 'Daily Report',
				description: `Daily report for the date ${new Date()}`,
				type: ReportType.DAILY,
				metadata: response,
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
			}

			const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER];

			this.eventEmitter.emit('send.notification', notification, recipients);

			// Prepare and send email
			if (userData?.user?.email) {
				// Get previous day metrics for comparison
				const previousDayOrders = ordersStats?.orders?.metrics?.totalOrders || 0;
				const previousDayRevenue = Number(ordersStats?.orders?.metrics?.grossOrderValue?.replace(/[^0-9.-]+/g, '')) || 0;

				// Calculate current day metrics
				const currentRevenue = Number(response?.overview?.orders?.metrics?.grossOrderValue) || 0;
				const currentOrders = response?.overview?.orders?.metrics?.totalOrders || 0;

				// Calculate satisfaction rate based on task completion (assuming non-pending tasks are completed)
				const totalTasks = response?.overview?.tasks?.total || 0;
				const pendingTasks = response?.overview?.tasks?.pending || 0;
				const satisfactionRate = totalTasks > 0
					? Math.round(((totalTasks - pendingTasks) / totalTasks) * 100)
					: 98;

				// Format metrics for better readability
				const emailData = {
					name: userData?.user?.username,
					date: new Date(),
					metrics: {
						totalOrders: currentOrders,
						totalRevenue: this.formatCurrency(currentRevenue),
						newCustomers: response.overview?.leads?.total || 0,
						satisfactionRate: Math.max(0, Math.min(100, satisfactionRate)), // Ensure between 0-100
						orderGrowth: this.calculateGrowth(currentOrders, previousDayOrders),
						revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
						customerGrowth: this.calculateGrowth(
							response.overview?.leads?.total || 0,
							(response.overview?.leads?.total || 0) - (response.overview?.leads?.pending || 0)
						)
					}
				};

				// Send to the user
				this.eventEmitter.emit('send.email', EmailType.DAILY_REPORT, [userData?.user?.email], emailData);

				// Send internal notification to managers/admins with user specific data if available
				const userSpecificData = response['userSpecific'];
				if (userSpecificData) {
					const internalEmailData = {
						name: 'Management Team',
						date: new Date(),
						metrics: {
							...emailData.metrics,
							userSpecific: {
								name: userSpecificData.user?.name,
								todayLeads: userSpecificData.todaysActivity?.leads || 0,
								todayClaims: userSpecificData.todaysActivity?.claims || 0,
								todayTasks: userSpecificData.todaysActivity?.tasks || 0,
								todayOrders: userSpecificData.todaysActivity?.orders || 0,
								hoursWorked: userSpecificData.todaysActivity?.currentShiftHours || 0
							}
						}
					};

					// Get internal broadcast email from config
					const internalEmail = this.configService.get<string>('INTERNAL_BROADCAST_EMAIL');
					if (internalEmail) {
						this.eventEmitter.emit('send.email', EmailType.DAILY_REPORT, [internalEmail], internalEmailData);
					}
				}
			}

			return response;
		} catch (error) {
			return this.handleError(error);
		}
	}
}
