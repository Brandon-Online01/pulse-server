import { Injectable } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { JournalService } from '../journal/journal.service';
import { ClaimsService } from '../claims/claims.service';
import { TasksService } from '../tasks/tasks.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class ReportsService {
	constructor(
		private readonly leadService: LeadsService,
		private readonly journalService: JournalService,
		private readonly claimsService: ClaimsService,
		private readonly tasksService: TasksService,
		private readonly shopService: ShopService,
		private readonly attendanceService: AttendanceService,
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

	private handleError(error: any) {
		return {
			message: error?.message || 'An error occurred',
			statusCode: error?.status || 500
		}
	}
}
