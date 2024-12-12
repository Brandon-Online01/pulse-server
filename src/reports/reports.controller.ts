import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('flash/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a flash report' })
  flash(@Param('ref') ref: number) {
    return this.reportsService.flash(ref);
  }

  @Get('daily/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a daily report' })
  daily(@Param('ref') ref: number) {
    return this.reportsService.dailyReport(ref);
  }

  @Get('overview')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get an overview report for the user bdashboard' })
  managerOverview(@Param('ref') ref: number) {
    return this.reportsService.managerOverview(ref);
  }

  @Get('overview/:userRef')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get an overview report for the user bdashboard' })
  overview(@Param('userRef') userRef: number) {
    return this.reportsService.overview(userRef);
  }
}
