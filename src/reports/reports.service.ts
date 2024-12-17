import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ReportsService {
	constructor(
		private readonly userService: UserService,
	) { }

	public async getDailyXP(ref: number): Promise<{ hours: number, xp: number, tasks: number, sales: number }> {
		const response = {
			hours: 89,
			xp: 8987,
			tasks: 8,
			sales: 88
		}

		return response
	}

	async flash(ref: number): Promise<{ hours: number, xp: number, tasks: number, sales: number }> {
		const response = {
			hours: 89,
			xp: 8987,
			tasks: 3,
			sales: 88
		}

		return response
	}

	async dailyReport(ref: number): Promise<{
		attendance: { checkIn: number, checkOut: number, totalHours: number },
		locations: { checkInLocation: number, checkOutLocation: number },
		leads: { total: number, entries: any[] },
		orders: { total: string, basket: number },
		claims: { total: number, entries: any[] },
		tasks: { pending: number, completed: number, total: number, postponed: number }
	}> {
		const response = {
			attendance: {
				checkIn: 12,
				checkOut: 12,
				totalHours: 12
			},
			locations: {
				checkInLocation: 12,
				checkOutLocation: 12
			},
			leads: {
				total: 12,
				entries: []
			},
			orders: {
				total: '1,210,129.99',
				basket: 15
			},
			claims: {
				total: 12,
				entries: []
			},
			tasks: {
				pending: 12,
				completed: 12,
				total: 12,
				postponed: 12
			}
		}

		return response
	}

	async overview(ref: number) {

		const response = {
			leads: {
				total: 12,
				entries: []
			},
			journals: {
				count: 12,
				entries: []
			},
			attendance: {
				progress: 80,
				avgDailyHours: 8.11,
				totalLate: 1.11,
				totalAbsent: 1.11,
				totalExcused: 1.11,
				totalPresent: 1.11
			},
			claims: {
				total: 12,
				entries: [],
				totalValue: '3400.99',
			},
			tasks: {
				pending: 1,
				completed: 10,
				total: 24,
				missed: 8,
				postponed: 5
			},
			orders: {
				basketTotal: '1,210.99',
				totalOrders: 15
			}
		}

		return response
	}

	async managerOverview() {
		const response = {
			leads: {
				total: 12,
				entries: []
			},
			journals: {
				total: 12,
				entries: []
			},
			attendance: {
				attendance: 80,
				avgDailyHours: 8.11,
				totalLate: 1.11,
				totalAbsent: 1.11,
				totalExcused: 1.11,
				totalPresent: 1.11
			},
			claims: {
				total: 12,
				entries: [],
				totalValue: '340201.99',
			},
			tasks: {
				pending: 1,
				completed: 10,
				total: 24,
				missed: 8,
				postponed: 5
			},
			orders: {
				total: '1,219.99',
				basket: 15
			}
		}

		return response
	}
}
