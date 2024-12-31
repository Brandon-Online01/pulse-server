import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a general company overview report with elevated access' })
  managerOverview() {
    return this.reportsService.managerOverview();
  }

  @Get('daily-report/:reference')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.USER)
  @ApiOperation({ summary: 'get daily activity report, optionally filtered for specific user roles' })
  dailyReport(@Param('reference') reference?: string) {
    return this.reportsService.dailyReport(reference);
  }
}
