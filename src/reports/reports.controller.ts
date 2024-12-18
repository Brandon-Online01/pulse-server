import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AccessLevel } from '../lib/enums/user.enums';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get an general company overview report with elevated access' })
  managerOverview() {
    return this.reportsService.managerOverview();
  }

  @Get('flash/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a flash report - personal report for the user' })
  flash(@Param('ref') ref: number) {
    return this.reportsService.flash(ref);
  }

  @Get('daily/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a daily report - personal report for the user' })
  daily(@Param('ref') ref: number) {
    return this.reportsService.dailyReport(ref);
  }

  @Get('overview/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get an overview report for the user dashboard - personal report for the user' })
  overview(@Param('ref') ref: number) {
    return this.reportsService.overview(ref);
  }
}
