import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Controller, UseGuards, Get, Param, ParseIntPipe, Request, NotFoundException } from '@nestjs/common';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { LiveUserReport } from './report.types';
import { LiveUserReportDto } from './dto/live-user-report.dto';
import { MapDataResponseDto } from './dto/map-data.dto';

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
		description: 'The reference ID of the user',
	})
	@ApiResponse({
		status: 200,
		description: 'Live user report retrieved successfully',
		type: LiveUserReportDto,
	})
	async userLiveOverview(@Param('ref', ParseIntPipe) ref: number): Promise<LiveUserReport> {
		return this.reportsService.userLiveOverview(ref);
	}

	@Get('map-data')
	@ApiOperation({ summary: 'Get map data for dashboard visualization' })
	@ApiResponse({
		status: 200,
		description: 'Map data retrieved successfully',
		type: MapDataResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Organisation or branch not found',
	})
	@ApiResponse({
		status: 500,
		description: 'Error retrieving map data',
	})
	async getMapData(@Request() req: any): Promise<MapDataResponseDto> {
		try {
			// Extract organization and branch info from the token
			const {
				organisationRef,
				branch: { uid: branchUid },
				uid: userUid,
			} = req.user || {};

			console.log('Map data requested for:', { organisationRef, branchUid, userUid });

			if (!organisationRef) {
				throw new NotFoundException('Organisation ID not found in request');
			}

			return this.reportsService.getMapData(organisationRef, branchUid, userUid);
		} catch (error) {
			// Log the detailed error for debugging
			console.error('Error in getMapData controller:', error);
			
			// Re-throw NotFoundException as-is so it returns a 404 status
			if (error instanceof NotFoundException) {
				throw error;
			}
			
			// For other errors, throw a more generic error message
			throw new Error(`Failed to retrieve map data: ${error.message}`);
		}
	}
}
