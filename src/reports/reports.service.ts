import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ReportsService {
	constructor(
		private readonly userService: UserService,
	) { }

	public async getDailyXP(ref: number): Promise<{ hours: number, xp: number, tasks: number, sales: number }> {
		const response = {
			hours: 8,
			xp: 87,
			tasks: 8,
			sales: 88
		}

		return response
	}

	async flash(ref: number): Promise<{ hours: number, xp: number, tasks: number, sales: number }> {
		const response = {
			hours: 8,
			xp: 87,
			tasks: 8,
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

	async overview(ref: number): Promise<{
		leads: { total: number },
		journals: { count: number, entries: any[] },
		attendance: { percentage: number, avg_hours: number },
		claims: { totalClaims: number, totalValue: number, byCategory: number },
		tasks: { pending: number, completed: number, total: number, postponed: number },
		orders: { total: string, basket: number }
	}> {

		const response = {
			leads: {
				total: 12
			},
			journals: {
				count: 12,
				entries: []
			},
			attendance: {
				percentage: 80,
				avg_hours: 8.11
			},
			claims: {
				totalClaims: 12,
				totalValue: 340201.99,
				byCategory: 12
			},
			tasks: {
				pending: 1,
				completed: 10,
				total: 24,
				missed: 8,
				postponed: 5
			},
			orders: {
				total: '1,210,129.99',
				basket: 15
			}
		}

		return response
	}

	async managerOverview(ref: number): Promise<{
		leads: { total: number },
		journals: { count: number, entries: any[] },
		attendance: { percentage: number, avg_hours: number },
		claims: { totalClaims: number, totalValue: number, byCategory: number },
		tasks: { pending: number, completed: number, total: number, postponed: number },
		orders: { total: string, basket: number }
	}> {

		const response = {
			leads: {
				total: 12
			},
			journals: {
				count: 12,
				entries: []
			},
			attendance: {
				percentage: 80,
				avg_hours: 8.11
			},
			claims: {
				totalClaims: 12,
				totalValue: 340201.99,
				byCategory: 12
			},
			tasks: {
				pending: 1,
				completed: 10,
				total: 24,
				missed: 8,
				postponed: 5
			},
			orders: {
				total: '1,210,129.99',
				basket: 15
			}
		}

		return response
	}
}
