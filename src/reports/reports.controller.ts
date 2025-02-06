import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Controller, Get, UseGuards, Param, Post, Body, Query } from '@nestjs/common';
import { AccessLevel } from '../lib/enums/user.enums';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post('generate')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Generate a report based on type and filters' })
  generateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.reportsService.generateReport(generateReportDto);
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
