import { AttendanceService } from './attendance.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  Patch,
  Query,
  Param,
} from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { Roles } from 'src/decorators/role.decorator';
import { AccessLevel } from 'src/lib/enums/enums';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('attendance')
@Controller('att')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('in')
  @Roles(
    AccessLevel.ADMIN,
    AccessLevel.MANAGER,
    AccessLevel.SUPERVISOR,
    AccessLevel.SUPPORT,
    AccessLevel.DEVELOPER,
    AccessLevel.USER
  )
  @ApiOperation({ summary: 'manage attendance, check in' })
  checkIn(
    @Body() createAttendanceDto: CreateCheckInDto) {
    return this.attendanceService.checkIn(createAttendanceDto);
  }

  @Post('out')
  @Roles(
    AccessLevel.ADMIN,
    AccessLevel.MANAGER,
    AccessLevel.SUPERVISOR,
    AccessLevel.SUPPORT,
    AccessLevel.DEVELOPER,
    AccessLevel.USER
  )
  @ApiOperation({ summary: 'manage attendance, check out' })
  checkOut(
    @Body() createAttendanceDto: CreateCheckOutDto) {
    return this.attendanceService.checkOut(createAttendanceDto);
  }

  @Patch('/:referenceCode')
  @Roles(
    AccessLevel.ADMIN,
    AccessLevel.MANAGER,
    AccessLevel.SUPERVISOR,
    AccessLevel.SUPPORT,
    AccessLevel.DEVELOPER,
    AccessLevel.USER
  )
  @ApiOperation({ summary: 'manage attendance, update attendance' })
  updateAttendance(
    @Param('referenceCode') referenceCode: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(referenceCode, updateAttendanceDto);
  }
}