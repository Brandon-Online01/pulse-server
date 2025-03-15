import { AttendanceService } from './attendance.service';
import {
	ApiOperation,
	ApiTags,
	ApiBody,
	ApiParam,
	ApiOkResponse,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Post, Body, Param, Get, UseGuards, Query } from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { CreateBreakDto } from './dto/create-attendance-break.dto';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Attendance } from './entities/attendance.entity';

@ApiTags('att')
@Controller('att')
@UseGuards(AuthGuard, RoleGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post('in')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Check in',
		description: 'Records a user check-in for attendance tracking',
	})
	@ApiBody({ type: CreateCheckInDto })
	@ApiCreatedResponse({
		description: 'Check-in recorded successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error recording check-in' },
			},
		},
	})
	checkIn(@Body() createAttendanceDto: CreateCheckInDto) {
		return this.attendanceService.checkIn(createAttendanceDto);
	}

	@Post('out')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Check out',
		description: 'Records a user check-out for attendance tracking',
	})
	@ApiBody({ type: CreateCheckOutDto })
	@ApiCreatedResponse({
		description: 'Check-out recorded successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error recording check-out' },
			},
		},
	})
	checkOut(@Body() createAttendanceDto: CreateCheckOutDto) {
		return this.attendanceService.checkOut(createAttendanceDto);
	}

	@Post('break')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Manage break',
		description: 'Start or end a break during a shift',
	})
	@ApiBody({ type: CreateBreakDto })
	@ApiCreatedResponse({
		description: 'Break action processed successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Break started/ended successfully' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error processing break action' },
			},
		},
	})
	manageBreak(@Body() breakDto: CreateBreakDto) {
		return this.attendanceService.manageBreak(breakDto);
	}

	@Get()
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Get all attendance records',
		description: 'Retrieves a list of all attendance check-ins',
	})
	@ApiOkResponse({
		description: 'Attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				attendances: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							uid: { type: 'number' },
							checkInTime: { type: 'string', format: 'date-time' },
							checkOutTime: { type: 'string', format: 'date-time' },
							// Other attendance properties
						},
					},
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	allCheckIns() {
		return this.attendanceService.allCheckIns();
	}

	@Get('date/:date')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Get attendance by date',
		description: 'Retrieves attendance records for a specific date',
	})
	@ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', type: 'string' })
	@ApiOkResponse({
		description: 'Attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				attendances: {
					type: 'array',
					items: { type: 'object' },
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	checkInsByDate(@Param('date') date: string) {
		return this.attendanceService.checkInsByDate(date);
	}

	@Get('user/:ref')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Get attendance by user',
		description: 'Retrieves attendance records for a specific user',
	})
	@ApiParam({ name: 'ref', description: 'User reference code', type: 'number' })
	@ApiOkResponse({
		description: 'User attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				attendances: {
					type: 'array',
					items: { type: 'object' },
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'User not found' },
				attendances: { type: 'null' },
			},
		},
	})
	checkInsByUser(@Param('ref') ref: number) {
		return this.attendanceService.checkInsByUser(ref);
	}

	@Get('status/:ref')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Get attendance by status',
		description: 'Retrieves attendance records filtered by status',
	})
	@ApiParam({ name: 'ref', description: 'Status reference code', type: 'number' })
	@ApiOkResponse({
		description: 'Status-filtered attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				attendances: {
					type: 'array',
					items: { type: 'object' },
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	checkInsByStatus(@Param('ref') ref: number) {
		return this.attendanceService.checkInsByStatus(ref);
	}

	@Get('branch/:ref')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Get attendance by branch',
		description: 'Retrieves attendance records for a specific branch',
	})
	@ApiParam({ name: 'ref', description: 'Branch reference code', type: 'string' })
	@ApiOkResponse({
		description: 'Branch attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				attendances: {
					type: 'array',
					items: { type: 'object' },
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Branch not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Branch not found' },
				attendances: { type: 'null' },
			},
		},
	})
	checkInsByBranch(@Param('ref') ref: string) {
		return this.attendanceService.checkInsByBranch(ref);
	}

	@Get('daily-stats/:uid')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiOperation({
		summary: 'Get daily attendance stats',
		description: 'Retrieves work and break times for a specific user for a day',
	})
	@ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
	@ApiOkResponse({
		description: 'Daily stats retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				dailyWorkTime: { type: 'number', example: 28800000 },
				dailyBreakTime: { type: 'number', example: 3600000 },
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	getDailyStats(@Param('uid') uid: number, @Query('date') date: string) {
		return this.attendanceService.getDailyStats(uid, date);
	}
}
