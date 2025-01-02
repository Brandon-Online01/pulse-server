import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AccessLevel } from '../lib/enums/user.enums';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('daily-report')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a general company overview report with elevated access' })
  managerDailyReport() {
    return this.reportsService.managerDailyReport();
  }

  @Get('daily-report/:reference')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.USER)
  @ApiOperation({ summary: 'get daily activity report, optionally filtered for specific user roles' })
  userDailyReport(@Param('reference') reference?: string) {
    return this.reportsService.userDailyReport(reference);
  }
}
