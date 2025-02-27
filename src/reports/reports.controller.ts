import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Controller, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { LiveUserReport } from './report.types';
import { LiveUserReportDto } from './dto/live-user-report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Get('live/:ref')
	@ApiOperation({ summary: 'Get live user report' })
	@ApiParam({ 
		name: 'ref', 
		type: 'number', 
		description: 'The reference ID of the user' 
	})
	@ApiResponse({
		status: 200,
		description: 'Live user report retrieved successfully',
		type: LiveUserReportDto,
	})
	async userLiveOverview(@Param('ref', ParseIntPipe) ref: number): Promise<LiveUserReport> {
		return this.reportsService.userLiveOverview(ref);
	}
}
