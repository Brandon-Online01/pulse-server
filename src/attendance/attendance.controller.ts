import { AttendanceService } from './attendance.service';
import { AttendanceReportsService } from './services/attendance-reports.service';
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
	ApiQuery,
	ApiProperty,
	ApiExtraModels,
} from '@nestjs/swagger';
import { Controller, Post, Body, Param, Get, UseGuards, Query, UseInterceptors, Req } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { CreateBreakDto } from './dto/create-attendance-break.dto';
import { OrganizationReportQueryDto } from './dto/organization-report-query.dto';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { AuthenticatedRequest } from '../lib/interfaces/authenticated-request.interface';
import { Attendance } from './entities/attendance.entity';

// Reusable Schema Definitions for Swagger Documentation
export class UserProfileSchema {
	@ApiProperty({ type: 'number', example: 45 })
	uid: number;

	@ApiProperty({ type: 'string', example: 'john.doe' })
	username: string;

	@ApiProperty({ type: 'string', example: 'John' })
	name: string;

	@ApiProperty({ type: 'string', example: 'Doe' })
	surname: string;

	@ApiProperty({ type: 'string', example: 'john.doe@company.com' })
	email: string;

	@ApiProperty({ type: 'string', example: '+27123456789', nullable: true })
	phone: string;

	@ApiProperty({ type: 'string', example: 'https://example.com/photo.jpg', nullable: true })
	photoURL: string;

	@ApiProperty({ type: 'string', example: 'employee' })
	role: string;

	@ApiProperty({ type: 'string', example: 'active' })
	status: string;

	@ApiProperty({ enum: AccessLevel, example: 'USER' })
	accessLevel: AccessLevel;

	@ApiProperty({ type: 'string', format: 'date-time' })
	createdAt: Date;

	@ApiProperty({ type: 'string', format: 'date-time' })
	updatedAt: Date;
}

export class BranchSchema {
	@ApiProperty({ type: 'number', example: 12 })
	uid: number;

	@ApiProperty({ type: 'string', example: 'Main Branch' })
	name: string;

	@ApiProperty({ type: 'string', example: 'MB001' })
	ref: string;

	@ApiProperty({ type: 'string', example: '123 Main Street, City' })
	address: string;
}

export class OrganisationSchema {
	@ApiProperty({ type: 'number', example: 1 })
	uid: number;

	@ApiProperty({ type: 'string', example: 'ABC Corporation' })
	name: string;

	@ApiProperty({ type: 'string', example: 'ABC001' })
	ref: string;
}

export class AttendanceWithUserProfileSchema {
	@ApiProperty({ type: 'number', example: 123 })
	uid: number;

	@ApiProperty({ enum: ['PRESENT', 'COMPLETED', 'ON_BREAK'], example: 'COMPLETED' })
	status: string;

	@ApiProperty({ type: 'string', format: 'date-time', example: '2024-03-01T09:00:00Z' })
	checkIn: Date;

	@ApiProperty({ type: 'string', format: 'date-time', example: '2024-03-01T17:30:00Z', nullable: true })
	checkOut: Date;

	@ApiProperty({ type: 'string', example: '8h 30m', nullable: true })
	duration: string;

	@ApiProperty({ type: 'number', example: -26.2041, nullable: true })
	checkInLatitude: number;

	@ApiProperty({ type: 'number', example: 28.0473, nullable: true })
	checkInLongitude: number;

	@ApiProperty({ type: 'string', example: 'Started work early today', nullable: true })
	checkInNotes: string;

	@ApiProperty({ type: 'string', example: 'Completed all tasks', nullable: true })
	checkOutNotes: string;

	@ApiProperty({ type: 'string', example: '1h 15m', nullable: true })
	totalBreakTime: string;

	@ApiProperty({ type: 'number', example: 2, nullable: true })
	breakCount: number;

	@ApiProperty({ type: UserProfileSchema })
	owner: UserProfileSchema;

	@ApiProperty({ type: BranchSchema, nullable: true })
	branch: BranchSchema;

	@ApiProperty({ type: OrganisationSchema, nullable: true })
	organisation: OrganisationSchema;
}

@ApiTags('att')
@Controller('att')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('reports')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
@ApiExtraModels(UserProfileSchema, BranchSchema, OrganisationSchema, AttendanceWithUserProfileSchema)
export class AttendanceController {
	constructor(
		private readonly attendanceService: AttendanceService,
		private readonly attendanceReportsService: AttendanceReportsService,
	) {}

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
	checkIn(
		@Body() createAttendanceDto: CreateCheckInDto,
		@Req() req: AuthenticatedRequest,
	) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;

		return this.attendanceService.checkIn(createAttendanceDto, orgId, branchId);
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
	checkOut(
		@Body() createAttendanceDto: CreateCheckOutDto,
		@Req() req: AuthenticatedRequest,
	) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;
		return this.attendanceService.checkOut(createAttendanceDto, orgId, branchId);
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
		description:
			'Retrieves a comprehensive list of all attendance check-ins with full user profiles, branch information, and verification details',
	})
	@ApiOkResponse({
		description: 'Attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				checkIns: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							uid: { type: 'number', example: 123 },
							status: {
								type: 'string',
								enum: ['PRESENT', 'COMPLETED', 'ON_BREAK'],
								example: 'COMPLETED',
							},
							checkIn: { type: 'string', format: 'date-time', example: '2024-03-01T09:00:00Z' },
							checkOut: {
								type: 'string',
								format: 'date-time',
								example: '2024-03-01T17:30:00Z',
								nullable: true,
							},
							duration: { type: 'string', example: '8h 30m', nullable: true },
							checkInLatitude: { type: 'number', example: -26.2041, nullable: true },
							checkInLongitude: { type: 'number', example: 28.0473, nullable: true },
							checkOutLatitude: { type: 'number', example: -26.2041, nullable: true },
							checkOutLongitude: { type: 'number', example: 28.0473, nullable: true },
							checkInNotes: { type: 'string', example: 'Started work early today', nullable: true },
							checkOutNotes: { type: 'string', example: 'Completed all tasks', nullable: true },
							totalBreakTime: { type: 'string', example: '1h 15m', nullable: true },
							breakCount: { type: 'number', example: 2, nullable: true },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
							verifiedAt: { type: 'string', format: 'date-time', nullable: true },
							owner: {
								type: 'object',
								properties: {
									uid: { type: 'number', example: 45 },
									username: { type: 'string', example: 'john.doe' },
									name: { type: 'string', example: 'John' },
									surname: { type: 'string', example: 'Doe' },
									email: { type: 'string', example: 'john.doe@company.com' },
									phone: { type: 'string', example: '+27123456789', nullable: true },
									photoURL: {
										type: 'string',
										example: 'https://example.com/photo.jpg',
										nullable: true,
									},
									role: { type: 'string', example: 'employee' },
									status: { type: 'string', example: 'active' },
									accessLevel: {
										type: 'string',
										enum: ['ADMIN', 'MANAGER', 'USER', 'TECHNICIAN'],
										example: 'USER',
									},
									createdAt: { type: 'string', format: 'date-time' },
									updatedAt: { type: 'string', format: 'date-time' },
									branch: {
										type: 'object',
										properties: {
											uid: { type: 'number', example: 12 },
											name: { type: 'string', example: 'Main Branch' },
											ref: { type: 'string', example: 'MB001' },
											address: { type: 'string', example: '123 Main Street, City' },
										},
										nullable: true,
									},
									organisation: {
										type: 'object',
										properties: {
											uid: { type: 'number', example: 1 },
											name: { type: 'string', example: 'ABC Corporation' },
											ref: { type: 'string', example: 'ABC001' },
										},
										nullable: true,
									},
									userProfile: {
										type: 'object',
										properties: {
											uid: { type: 'number' },
											bio: { type: 'string', nullable: true },
											dateOfBirth: { type: 'string', format: 'date', nullable: true },
											address: { type: 'string', nullable: true },
											emergencyContact: { type: 'string', nullable: true },
										},
										nullable: true,
									},
								},
							},
							verifiedBy: {
								type: 'object',
								properties: {
									uid: { type: 'number' },
									name: { type: 'string' },
									surname: { type: 'string' },
									email: { type: 'string' },
									accessLevel: { type: 'string' },
								},
								nullable: true,
							},
							organisation: {
								type: 'object',
								properties: {
									uid: { type: 'number' },
									name: { type: 'string' },
									ref: { type: 'string' },
								},
								nullable: true,
							},
							branch: {
								type: 'object',
								properties: {
									uid: { type: 'number' },
									name: { type: 'string' },
									ref: { type: 'string' },
									address: { type: 'string' },
								},
								nullable: true,
							},
						},
					},
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'No attendance records found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance records found' },
				checkIns: { type: 'null' },
			},
		},
	})
	allCheckIns(@Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;
		return this.attendanceService.allCheckIns(orgId, branchId);
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
		description:
			'Retrieves comprehensive attendance records for a specific date with full user profiles, branch information, and verification details ordered by check-in time',
	})
	@ApiParam({
		name: 'date',
		description: 'Date in YYYY-MM-DD format to filter attendance records',
		type: 'string',
		example: '2024-03-01',
	})
	@ApiOkResponse({
		description: 'Date-filtered attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				checkIns: {
					type: 'array',
					description:
						'Array of attendance records for the specified date, ordered by check-in time (newest first)',
					items: {
						$ref: '#/components/schemas/AttendanceWithUserProfileSchema',
					},
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'No attendance records found for the specified date',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance records found for 2024-03-01' },
				checkIns: { type: 'null' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid date format',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid date format. Please use YYYY-MM-DD format' },
				checkIns: { type: 'null' },
			},
		},
	})
	checkInsByDate(@Param('date') date: string, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;
		return this.attendanceService.checkInsByDate(date, orgId, branchId);
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
		description:
			'Retrieves comprehensive attendance records for a specific user with full user profile, branch information, and verification details ordered by check-in time',
	})
	@ApiParam({
		name: 'ref',
		description: 'User ID to retrieve attendance records for',
		type: 'number',
		example: 45,
	})
	@ApiOkResponse({
		description: 'User attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				checkIns: {
					type: 'array',
					description:
						'Array of attendance records for the specified user, ordered by check-in time (newest first)',
					items: {
						$ref: '#/components/schemas/AttendanceWithUserProfileSchema',
					},
				},
				user: {
					type: 'object',
					description: 'Complete user profile information including branch and organization details',
					properties: {
						uid: { type: 'number', example: 45 },
						username: { type: 'string', example: 'john.doe' },
						name: { type: 'string', example: 'John' },
						surname: { type: 'string', example: 'Doe' },
						email: { type: 'string', example: 'john.doe@company.com' },
						phone: { type: 'string', example: '+27123456789', nullable: true },
						photoURL: { type: 'string', example: 'https://example.com/photo.jpg', nullable: true },
						role: { type: 'string', example: 'employee' },
						status: { type: 'string', example: 'active' },
						accessLevel: {
							type: 'string',
							enum: ['ADMIN', 'MANAGER', 'USER', 'TECHNICIAN', 'HR'],
							example: 'USER',
						},
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						branch: {
							type: 'object',
							description: 'Branch information where the user is assigned',
							properties: {
								uid: { type: 'number', example: 12 },
								name: { type: 'string', example: 'Main Branch' },
								ref: { type: 'string', example: 'MB001' },
								address: { type: 'string', example: '123 Main Street, City' },
							},
							nullable: true,
						},
						organisation: {
							type: 'object',
							description: 'Organization information the user belongs to',
							properties: {
								uid: { type: 'number', example: 1 },
								name: { type: 'string', example: 'ABC Corporation' },
								ref: { type: 'string', example: 'ABC001' },
							},
							nullable: true,
						},
						userProfile: {
							type: 'object',
							description: 'Additional user profile information',
							properties: {
								uid: { type: 'number' },
								bio: { type: 'string', nullable: true },
								dateOfBirth: { type: 'string', format: 'date', nullable: true },
								address: { type: 'string', nullable: true },
								emergencyContact: { type: 'string', nullable: true },
							},
							nullable: true,
						},
					},
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User not found or no attendance records found for user',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance records found for user ID 45' },
				checkIns: { type: 'null' },
				user: { type: 'null' },
			},
		},
	})
	checkInsByUser(@Param('ref') ref: number, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;
		return this.attendanceService.checkInsByUser(ref, orgId, branchId);
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
		summary: 'Get user attendance status',
		description:
			'Retrieves the latest attendance status for a specific user with complete user profile and shift information including timing details and next available action',
	})
	@ApiParam({
		name: 'ref',
		description: 'User ID to retrieve attendance status for',
		type: 'number',
		example: 45,
	})
	@ApiOkResponse({
		description: 'User attendance status retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				startTime: {
					type: 'string',
					description: 'Check-in timestamp for the latest shift',
					example: '2024-03-01T09:00:00.000Z',
				},
				endTime: {
					type: 'string',
					description: 'Check-out timestamp (null if currently active)',
					example: '2024-03-01T17:30:00.000Z',
					nullable: true,
				},
				createdAt: { type: 'string', format: 'date-time' },
				updatedAt: { type: 'string', format: 'date-time' },
				verifiedAt: { type: 'string', format: 'date-time', nullable: true },
				nextAction: {
					type: 'string',
					description: 'Suggested next action for the user',
					enum: ['Start Shift', 'End Shift'],
					example: 'End Shift',
				},
				isLatestCheckIn: {
					type: 'boolean',
					description: 'Whether the latest check-in was today',
					example: true,
				},
				checkedIn: {
					type: 'boolean',
					description: 'Current check-in status of the user',
					example: true,
				},
				user: {
					type: 'object',
					description: 'Complete user profile information',
					properties: {
						uid: { type: 'number', example: 45 },
						username: { type: 'string', example: 'john.doe' },
						name: { type: 'string', example: 'John' },
						surname: { type: 'string', example: 'Doe' },
						email: { type: 'string', example: 'john.doe@company.com' },
						phone: { type: 'string', example: '+27123456789', nullable: true },
						photoURL: { type: 'string', example: 'https://example.com/photo.jpg', nullable: true },
						role: { type: 'string', example: 'employee' },
						status: { type: 'string', example: 'active' },
						accessLevel: {
							type: 'string',
							enum: ['ADMIN', 'MANAGER', 'USER', 'TECHNICIAN', 'HR'],
							example: 'USER',
						},
						branch: {
							type: 'object',
							properties: {
								uid: { type: 'number', example: 12 },
								name: { type: 'string', example: 'Main Branch' },
								ref: { type: 'string', example: 'MB001' },
							},
							nullable: true,
						},
						organisation: {
							type: 'object',
							properties: {
								uid: { type: 'number', example: 1 },
								name: { type: 'string', example: 'ABC Corporation' },
								ref: { type: 'string', example: 'ABC001' },
							},
							nullable: true,
						},
					},
				},
				attendance: {
					type: 'object',
					description: 'Complete attendance record details',
					properties: {
						uid: { type: 'number', example: 123 },
						status: { type: 'string', enum: ['PRESENT', 'COMPLETED', 'ON_BREAK'], example: 'PRESENT' },
						checkIn: { type: 'string', format: 'date-time' },
						checkOut: { type: 'string', format: 'date-time', nullable: true },
						duration: { type: 'string', example: '8h 30m', nullable: true },
						checkInLatitude: { type: 'number', nullable: true },
						checkInLongitude: { type: 'number', nullable: true },
						checkOutLatitude: { type: 'number', nullable: true },
						checkOutLongitude: { type: 'number', nullable: true },
						totalBreakTime: { type: 'string', example: '1h 15m', nullable: true },
						breakCount: { type: 'number', example: 2, nullable: true },
					},
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User not found or no attendance records found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance records found for user ID 45' },
				startTime: { type: 'null' },
				endTime: { type: 'null' },
				nextAction: { type: 'null' },
				isLatestCheckIn: { type: 'boolean', example: false },
				checkedIn: { type: 'boolean', example: false },
				user: { type: 'null' },
				attendance: { type: 'null' },
			},
		},
	})
	checkInsByStatus(@Param('ref') ref: number, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;
		return this.attendanceService.checkInsByStatus(ref, orgId, branchId);
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
		description:
			'Retrieves comprehensive attendance records for a specific branch with full user profiles, branch information, and summary statistics including unique user count',
	})
	@ApiParam({
		name: 'ref',
		description: 'Branch reference code to filter attendance records',
		type: 'string',
		example: 'MB001',
	})
	@ApiOkResponse({
		description: 'Branch attendance records retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				checkIns: {
					type: 'array',
					description:
						'Array of attendance records for the specified branch, ordered by check-in time (newest first)',
					items: {
						$ref: '#/components/schemas/AttendanceWithUserProfileSchema',
					},
				},
				branch: {
					type: 'object',
					description: 'Complete branch information',
					properties: {
						uid: { type: 'number', example: 12 },
						name: { type: 'string', example: 'Main Branch' },
						ref: { type: 'string', example: 'MB001' },
						address: { type: 'string', example: '123 Main Street, City' },
						city: { type: 'string', example: 'Johannesburg' },
						province: { type: 'string', example: 'Gauteng' },
						postalCode: { type: 'string', example: '2000' },
						phone: { type: 'string', example: '+27111234567', nullable: true },
						email: { type: 'string', example: 'mainbranch@company.com', nullable: true },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
					},
					nullable: true,
				},
				totalUsers: {
					type: 'number',
					description: 'Number of unique users who have attendance records in this branch',
					example: 15,
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Branch not found or no attendance records found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance records found for branch MB001' },
				checkIns: { type: 'null' },
				branch: { type: 'null' },
				totalUsers: { type: 'number', example: 0 },
			},
		},
	})
	checkInsByBranch(@Param('ref') ref: string, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		return this.attendanceService.checkInsByBranch(ref, orgId);
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
		summary: 'Get daily attendance statistics',
		description:
			'Retrieves detailed work and break time statistics for a specific user for a given day (defaults to today). Returns time in milliseconds for precise calculations.',
	})
	@ApiParam({
		name: 'uid',
		description: 'User ID to retrieve daily statistics for',
		type: 'number',
		example: 45,
	})
	@ApiQuery({
		name: 'date',
		required: false,
		description: 'Date in YYYY-MM-DD format (defaults to today)',
		type: 'string',
		example: '2024-03-01',
	})
	@ApiOkResponse({
		description: 'Daily attendance statistics retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				dailyWorkTime: {
					type: 'number',
					example: 28800000,
					description: 'Total work time for the day in milliseconds (excluding breaks)',
				},
				dailyBreakTime: {
					type: 'number',
					example: 3600000,
					description: 'Total break time for the day in milliseconds',
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User not found or no attendance data for the specified date',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance data found for user ID 45 on 2024-03-01' },
				dailyWorkTime: { type: 'number', example: 0 },
				dailyBreakTime: { type: 'number', example: 0 },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid date format or user ID',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid date format. Please use YYYY-MM-DD format' },
				dailyWorkTime: { type: 'number', example: 0 },
				dailyBreakTime: { type: 'number', example: 0 },
			},
		},
	})
	getDailyStats(@Param('uid') uid: number, @Query('date') date: string) {
		return this.attendanceService.getDailyStats(uid, date);
	}

	// ======================================================
	// ATTENDANCE METRICS ENDPOINTS
	// ======================================================

	@Get('metrics/:uid')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
		AccessLevel.HR,
	)
	@ApiOperation({
		summary: 'Get comprehensive user attendance metrics',
		description:
			'Retrieves detailed attendance analytics for a specific user including historical data, productivity insights, break patterns, timing analysis, and performance metrics across different time periods',
	})
	@ApiParam({
		name: 'uid',
		description: 'User ID to retrieve comprehensive attendance metrics for',
		type: 'number',
		example: 45,
	})
	@ApiOkResponse({
		description: 'Attendance metrics retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				metrics: {
					type: 'object',
					description: 'Comprehensive attendance metrics and analytics',
					properties: {
						firstAttendance: {
							type: 'object',
							description: "Information about the user's first recorded attendance",
							properties: {
								date: { type: 'string', format: 'date', example: '2024-01-15', nullable: true },
								checkInTime: { type: 'string', example: '08:30:00', nullable: true },
								daysAgo: { type: 'number', example: 45, nullable: true },
							},
						},
						lastAttendance: {
							type: 'object',
							description: "Information about the user's most recent attendance",
							properties: {
								date: { type: 'string', format: 'date', example: '2024-03-01', nullable: true },
								checkInTime: { type: 'string', example: '09:00:00', nullable: true },
								checkOutTime: { type: 'string', example: '17:30:00', nullable: true },
								daysAgo: { type: 'number', example: 1, nullable: true },
							},
						},
						totalHours: {
							type: 'object',
							description: 'Total working hours across different time periods',
							properties: {
								allTime: {
									type: 'number',
									example: 320.5,
									description: 'Total hours worked since first attendance',
								},
								thisMonth: {
									type: 'number',
									example: 160.0,
									description: 'Hours worked in current month',
								},
								thisWeek: {
									type: 'number',
									example: 40.0,
									description: 'Hours worked in current week',
								},
								today: { type: 'number', example: 8.0, description: 'Hours worked today' },
							},
						},
						totalShifts: {
							type: 'object',
							description: 'Total number of shifts worked across different time periods',
							properties: {
								allTime: {
									type: 'number',
									example: 45,
									description: 'Total shifts since first attendance',
								},
								thisMonth: {
									type: 'number',
									example: 20,
									description: 'Shifts worked in current month',
								},
								thisWeek: { type: 'number', example: 5, description: 'Shifts worked in current week' },
								today: { type: 'number', example: 1, description: 'Shifts worked today' },
							},
						},
						averageHoursPerDay: {
							type: 'number',
							example: 7.1,
							description: 'Average hours worked per day since first attendance',
						},
						attendanceStreak: {
							type: 'number',
							example: 5,
							description: 'Number of consecutive days with attendance records',
						},
						breakAnalytics: {
							type: 'object',
							description: 'Comprehensive break time analysis and patterns',
							properties: {
								totalBreakTime: {
									type: 'object',
									description: 'Total break time across different periods (in minutes)',
									properties: {
										allTime: {
											type: 'number',
											example: 450,
											description: 'Total break minutes since first attendance',
										},
										thisMonth: {
											type: 'number',
											example: 240,
											description: 'Break minutes in current month',
										},
										thisWeek: {
											type: 'number',
											example: 75,
											description: 'Break minutes in current week',
										},
										today: { type: 'number', example: 30, description: 'Break minutes today' },
									},
								},
								averageBreakDuration: {
									type: 'number',
									example: 22,
									description: 'Average break duration per shift in minutes',
								},
								breakFrequency: {
									type: 'number',
									example: 1.8,
									description: 'Average number of breaks per shift',
								},
								longestBreak: {
									type: 'number',
									example: 45,
									description: 'Longest single break duration in minutes',
								},
								shortestBreak: {
									type: 'number',
									example: 5,
									description: 'Shortest single break duration in minutes',
								},
							},
						},
						timingPatterns: {
							type: 'object',
							description: 'Analysis of check-in/check-out timing patterns',
							properties: {
								averageCheckInTime: {
									type: 'string',
									example: '08:52:00',
									description: 'Average check-in time across all shifts',
								},
								averageCheckOutTime: {
									type: 'string',
									example: '17:23:00',
									description: 'Average check-out time across completed shifts',
								},
								punctualityScore: {
									type: 'number',
									example: 85,
									description: 'Percentage of on-time arrivals (before 9:15 AM)',
								},
								overtimeFrequency: {
									type: 'number',
									example: 30,
									description: 'Percentage of shifts with overtime (>8 hours)',
								},
							},
						},
						productivityInsights: {
							type: 'object',
							description: 'Productivity and performance analysis',
							properties: {
								workEfficiencyScore: {
									type: 'number',
									example: 88,
									description:
										'Work efficiency percentage (work time vs total time including breaks)',
								},
								shiftCompletionRate: {
									type: 'number',
									example: 95,
									description: 'Percentage of shifts that were properly checked out',
								},
								lateArrivalsCount: {
									type: 'number',
									example: 3,
									description: 'Number of late arrivals (after 9:15 AM)',
								},
								earlyDeparturesCount: {
									type: 'number',
									example: 1,
									description: 'Number of early departures (before 5:00 PM)',
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User not found or no attendance data',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No attendance data found for user' },
			},
		},
	})
	getUserAttendanceMetrics(@Param('uid') uid: number) {
		return this.attendanceService.getUserAttendanceMetrics(uid);
	}

	@Get('report')
	@UseInterceptors(CacheInterceptor)
	@CacheTTL(300) // Cache for 5 minutes
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.HR)
	@ApiOperation({
		summary: 'Generate organization attendance report',
		description:
			'Generates comprehensive attendance report including individual user metrics and organization-level analytics',
	})
	@ApiQuery({ name: 'dateFrom', required: false, description: 'Start date for report period (YYYY-MM-DD)' })
	@ApiQuery({ name: 'dateTo', required: false, description: 'End date for report period (YYYY-MM-DD)' })
	@ApiQuery({ name: 'branchId', required: false, description: 'Filter by specific branch ID' })
	@ApiQuery({ name: 'role', required: false, enum: AccessLevel, description: 'Filter by role/access level' })
	@ApiQuery({
		name: 'includeUserDetails',
		required: false,
		type: 'boolean',
		description: 'Include individual user breakdowns',
	})
	@ApiOkResponse({
		description: 'Organization attendance report generated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				report: {
					type: 'object',
					properties: {
						reportPeriod: {
							type: 'object',
							properties: {
								from: { type: 'string', example: '2024-01-01' },
								to: { type: 'string', example: '2024-03-31' },
								totalDays: { type: 'number', example: 90 },
								generatedAt: { type: 'string', example: '2024-04-01T10:30:00Z' },
							},
						},
						userMetrics: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									userId: { type: 'number' },
									userInfo: {
										type: 'object',
										properties: {
											name: { type: 'string' },
											email: { type: 'string' },
											role: { type: 'string' },
											branch: { type: 'string' },
										},
									},
									metrics: {
										type: 'object',
										properties: {
											totalHours: {
												type: 'object',
												properties: {
													allTime: { type: 'number' },
													thisMonth: { type: 'number' },
													thisWeek: { type: 'number' },
													today: { type: 'number' },
												},
											},
											totalShifts: {
												type: 'object',
												properties: {
													allTime: { type: 'number' },
													thisMonth: { type: 'number' },
													thisWeek: { type: 'number' },
													today: { type: 'number' },
												},
											},
											averageHoursPerDay: { type: 'number' },
											attendanceStreak: { type: 'number' },
										},
									},
								},
							},
						},
						organizationMetrics: {
							type: 'object',
							properties: {
								averageTimes: {
									type: 'object',
									properties: {
										startTime: { type: 'string', example: '09:15:30' },
										endTime: { type: 'string', example: '17:45:20' },
										shiftDuration: { type: 'number', example: 8.5 },
										breakDuration: { type: 'number', example: 1.0 },
									},
								},
								totals: {
									type: 'object',
									properties: {
										totalEmployees: { type: 'number' },
										totalHours: { type: 'number' },
										totalShifts: { type: 'number' },
										overtimeHours: { type: 'number' },
									},
								},
								byBranch: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											branchId: { type: 'string' },
											branchName: { type: 'string' },
											employeeCount: { type: 'number' },
											totalHours: { type: 'number' },
											averageHoursPerEmployee: { type: 'number' },
										},
									},
								},
								byRole: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											role: { type: 'string' },
											employeeCount: { type: 'number' },
											totalHours: { type: 'number' },
											averageHoursPerEmployee: { type: 'number' },
										},
									},
								},
								insights: {
									type: 'object',
									properties: {
										attendanceRate: { type: 'number' },
										punctualityRate: { type: 'number' },
										averageHoursPerDay: { type: 'number' },
										peakCheckInTime: { type: 'string' },
										peakCheckOutTime: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid query parameters',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid date format or query parameters' },
			},
		},
	})
	getOrganizationReport(@Query() queryDto: OrganizationReportQueryDto, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid || req.user?.organisationRef;
		const branchId = req.user?.branch?.uid;

		return this.attendanceService.generateOrganizationReport(queryDto, orgId, branchId);
	}

	@Post('reports/morning/send')
	@Roles(AccessLevel.ADMIN, AccessLevel.OWNER, AccessLevel.HR)
	@ApiOperation({
		summary: 'Manually send morning attendance report',
		description:
			'Manually trigger sending of morning attendance report for the organization. Useful for testing or ad-hoc reporting.',
	})
	@ApiCreatedResponse({
		description: 'Morning attendance report sent successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Morning attendance report sent successfully' },
				recipients: { type: 'number', example: 3, description: 'Number of recipients who received the report' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Unable to send report',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Unable to send morning report: insufficient data' },
			},
		},
	})
	async sendMorningReport(@Req() req: AuthenticatedRequest) {
		try {
			const orgId = req.user?.org?.uid || req.user?.organisationRef;

			if (!orgId) {
				return { message: 'Organization not found' };
			}

			await this.attendanceReportsService.generateAndSendMorningReport(orgId);
			return {
				message: 'Morning attendance report sent successfully',
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				message: `Error sending morning report: ${error.message}`,
				timestamp: new Date().toISOString(),
			};
		}
	}

	@Post('reports/evening/send')
	@Roles(AccessLevel.ADMIN, AccessLevel.OWNER, AccessLevel.HR)
	@ApiOperation({
		summary: 'Manually send evening attendance report',
		description:
			'Manually trigger sending of evening attendance report for the organization. Useful for testing or ad-hoc reporting.',
	})
	@ApiCreatedResponse({
		description: 'Evening attendance report sent successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Evening attendance report sent successfully' },
				recipients: { type: 'number', example: 3, description: 'Number of recipients who received the report' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Unable to send report',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Unable to send evening report: insufficient data' },
			},
		},
	})
	async sendEveningReport(@Req() req: AuthenticatedRequest) {
		try {
			const orgId = req.user?.org?.uid || req.user?.organisationRef;

			if (!orgId) {
				return { message: 'Organization not found' };
			}

			await this.attendanceReportsService.generateAndSendEveningReport(orgId);
			return {
				message: 'Evening attendance report sent successfully',
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				message: `Error sending evening report: ${error.message}`,
				timestamp: new Date().toISOString(),
			};
		}
	}
}
