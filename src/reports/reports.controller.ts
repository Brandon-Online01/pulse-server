import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Controller, Get, UseGuards, Param, Post, Body, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AccessLevel } from '../lib/enums/user.enums';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportResponse } from './types/report-response.types';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) { }

  @Post('generate')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Generate a report based on type and filters' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateReport(@Body() generateReportDto: GenerateReportDto): Promise<ReportResponse> {
    this.logger.log('Received report generation request', generateReportDto);
    try {
      const report = await this.reportsService.generateReport(generateReportDto);
      this.logger.log('Report generated successfully', { reportId: report.metadata.generatedAt });
      return report;
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to generate report',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('daily-report')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'Get a general company overview report with elevated access' })
  @ApiResponse({ status: 200, description: 'Daily report retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async managerDailyReport() {
    try {
      const report = await this.reportsService.managerDailyReport();
      this.logger.log('Manager daily report generated successfully');
      return report;
    } catch (error) {
      this.logger.error(`Failed to generate manager daily report: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to generate daily report',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('daily-report/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.USER)
  @ApiOperation({ summary: 'Get daily activity report, optionally filtered for specific user roles' })
  @ApiResponse({ status: 200, description: 'User daily report retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async userDailyReport(@Param('reference') reference?: string) {
    try {
      const report = await this.reportsService.userDailyReport(reference);
      this.logger.log('User daily report generated successfully', { userRef: reference });
      return report;
    } catch (error) {
      this.logger.error(`Failed to generate user daily report: ${error.message}`, error.stack);
      if (error.message.includes('not found')) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
            message: error.message
          },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to generate daily report',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
