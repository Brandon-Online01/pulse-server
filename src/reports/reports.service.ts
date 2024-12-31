import { Injectable, Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { JournalService } from '../journal/journal.service';
import { ClaimsService } from '../claims/claims.service';
import { TasksService } from '../tasks/tasks.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { ShopService } from '../shop/shop.service';
import { NewsService } from '../news/news.service';
import { UserService } from '../user/user.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ReportsService {
	private readonly logger = new Logger(ReportsService.name);

	constructor(
		private readonly leadService: LeadsService,
		private readonly journalService: JournalService,
		private readonly claimsService: ClaimsService,
		private readonly tasksService: TasksService,
		private readonly shopService: ShopService,
		private readonly attendanceService: AttendanceService,
		private readonly newsService: NewsService,
		private readonly userService: UserService,
	) { }

	async managerOverview() {
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
	async dailyReport(reference?: string) {
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
						total: tasksTotal || 0
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

			return response;
		} catch (error) {
			return this.handleError(error);
		}
	}

	private handleError(error: any) {
		return {
			message: error?.message || 'An error occurred',
			statusCode: error?.status || 500
		}
	}
}
