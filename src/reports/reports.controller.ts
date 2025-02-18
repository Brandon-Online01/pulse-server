import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Controller, Get, UseGuards, Param, Post, Body, Query, Logger } from '@nestjs/common';
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
  async generateReport(@Body() generateReportDto: GenerateReportDto): Promise<ReportResponse> {
    this.logger.log('Received report generation request', generateReportDto);
    try {
      const report = await this.reportsService.generateReport(generateReportDto);
      this.logger.log('Report generated successfully', { reportId: report.metadata.generatedAt });
      return report;
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('daily-report')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a general company overview report with elevated access' })
  managerDailyReport() {
    return this.reportsService.managerDailyReport();
  }

  @Get('daily-report/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.USER)
  @ApiOperation({ summary: 'get daily activity report, optionally filtered for specific user roles' })
  userDailyReport(@Param('reference') reference?: string) {
    return this.reportsService.userDailyReport(reference);
  }
}
