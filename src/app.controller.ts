import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('🔧 System Health')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@ApiOperation({ summary: 'Health check endpoint' })
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('health/database')
	@ApiOperation({ summary: 'Get database connection status' })
	@ApiResponse({ status: 200, description: 'Database status retrieved' })
	getDatabaseStatus() {
		return {
			status: 'Database Status Check',
			timestamp: new Date().toISOString(),
			...this.appService.getDatabaseStatus(),
		};
	}

	@Post('health/database/reconnect')
	@ApiOperation({ summary: 'Force database reconnection' })
	@ApiResponse({ status: 200, description: 'Reconnection attempt completed' })
	async forceReconnect() {
		const result = await this.appService.forceReconnect();
		return {
			timestamp: new Date().toISOString(),
			...result,
		};
	}
}
