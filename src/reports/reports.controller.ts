import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(RoleGuard, AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('/highlights')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'Get home page highlight card content' })
  homeHighlights() {
    return this.reportsService.homeHighlights();
  }

  @Get('/user-highlights')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'Get user page highlight cards content' })
  userHighlights() {
    return this.reportsService.userHighlights();
  }
}
