import { AttendanceService } from './attendance.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	Controller,
	Post,
	Body,
	Param,
	Get,
	UseGuards,
} from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@ApiTags('att')
@Controller('att')
@UseGuards(AuthGuard, RoleGuard)
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) { }

	@Post('in')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'manage attendance, check in' })
	checkIn(@Body() createAttendanceDto: CreateCheckInDto) {
		return this.attendanceService.checkIn(createAttendanceDto);
	}

	@Post('out')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'manage attendance, check out' })
	checkOut(@Body() createAttendanceDto: CreateCheckOutDto) {
		return this.attendanceService.checkOut(createAttendanceDto);
	}

	@Get()
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'get all check ins' })
	allCheckIns() {
		return this.attendanceService.allCheckIns();
	}

	@Get('date/:date')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'get check ins by date' })
	checkInsByDate(@Param('date') date: string) {
		return this.attendanceService.checkInsByDate(date);
	}

	@Get('user/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'get check ins by user reference code' })
	checkInsByUser(@Param('ref') ref: number) {
		return this.attendanceService.checkInsByUser(ref);
	}

	@Get('status/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'get check ins by status' })
	checkInsByStatus(@Param('ref') ref: number) {
		return this.attendanceService.checkInsByStatus(ref);
	}

	@Get('branch/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({ summary: 'get check ins by branch reference code' })
	checkInsByBranch(@Param('ref') ref: string) {
		return this.attendanceService.checkInsByBranch(ref);
	}
}
