import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
