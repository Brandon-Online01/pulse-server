import { AttendanceService } from './attendance.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@ApiTags('att')
@Controller('att')
@UseGuards(AuthGuard, RoleGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('in')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'manage attendance, check in' })
  checkIn(
    @Body() createAttendanceDto: CreateCheckInDto) {
    return this.attendanceService.checkIn(createAttendanceDto);
  }

  @Post('out')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'manage attendance, check out' })
  checkOut(
    @Body() createAttendanceDto: CreateCheckOutDto) {
    return this.attendanceService.checkOut(createAttendanceDto);
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all check ins' })
  allCheckIns() {
    return this.attendanceService.allCheckIns();
  }

  @Get('date/:date')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get check ins by date' })
  checkInsByDate(@Param('date') date: string) {
    return this.attendanceService.checkInsByDate(date);
  }

  @Get('user/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get check ins by user reference code' })
  checkInsByUser(@Param('ref') ref: number) {
    return this.attendanceService.checkInsByUser(ref);
  }

  @Get('branch/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get check ins by branch reference code' })
  checkInsByBranch(@Param('ref') ref: string) {
    return this.attendanceService.checkInsByBranch(ref);
  }


}
