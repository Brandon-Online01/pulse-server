import { UserService } from './user.service';
import { RoleGuard } from '../guards/role.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/role.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
	ApiOperation,
	ApiTags,
	ApiParam,
	ApiBody,
	ApiOkResponse,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiUnauthorizedResponse,
	ApiQuery,
} from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { AccountStatus } from '../lib/enums/status.enums';
import { AuthenticatedRequest } from '../lib/interfaces/authenticated-request.interface';
import { CreateUserTargetDto } from './dto/create-user-target.dto';
import { UpdateUserTargetDto } from './dto/update-user-target.dto';

@ApiTags('user')
@Controller('user')
@UseGuards(AuthGuard, RoleGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized access due to invalid credentials or missing token' })
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
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
		summary: 'Create a new user',
		description: 'Creates a new user with the provided data. Accessible by users with appropriate roles.',
	})
	@ApiBody({ type: CreateUserDto })
	@ApiCreatedResponse({
		description: 'User created successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
				data: {
					type: 'object',
					properties: {
						uid: { type: 'number', example: 1 },
						username: { type: 'string', example: 'brandon123' },
						name: { type: 'string', example: 'Brandon' },
						surname: { type: 'string', example: 'Nkawu' },
						email: { type: 'string', example: 'brandon@loro.co.za' },
						phone: { type: 'string', example: '+27 64 123 4567' },
						photoURL: { type: 'string', example: 'https://example.com/photo.jpg' },
						accessLevel: { type: 'string', enum: Object.values(AccessLevel), example: AccessLevel.USER },
						status: { type: 'string', enum: Object.values(AccountStatus), example: AccountStatus.ACTIVE },
						userref: { type: 'string', example: 'USR123456' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid input data provided' })
	create(@Body() createUserDto: CreateUserDto, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.userService.create(createUserDto, orgId, branchId);
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
		summary: 'Get all users',
		description: 'Retrieves all users with optional filtering and pagination. Requires ADMIN or MANAGER role.',
	})
	@ApiQuery({ name: 'page', description: 'Page number for pagination', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', description: 'Number of items per page', required: false, type: Number, example: 10 })
	@ApiQuery({ name: 'status', description: 'Filter by account status', required: false, enum: AccountStatus })
	@ApiQuery({ name: 'accessLevel', description: 'Filter by access level', required: false, enum: AccessLevel })
	@ApiQuery({ name: 'search', description: 'Search term for filtering users', required: false, type: String })
	@ApiQuery({ name: 'branchId', description: 'Filter by branch ID', required: false, type: Number })
	@ApiQuery({ name: 'organisationId', description: 'Filter by organisation ID', required: false, type: Number })
	@ApiOkResponse({
		description: 'List of users with pagination',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							uid: { type: 'number', example: 1 },
							username: { type: 'string', example: 'brandon123' },
							name: { type: 'string', example: 'Brandon' },
							surname: { type: 'string', example: 'Nkawu' },
							email: { type: 'string', example: 'brandon@loro.co.za' },
							phone: { type: 'string', example: '+27 64 123 4567' },
							photoURL: { type: 'string', example: 'https://example.com/photo.jpg' },
							accessLevel: {
								type: 'string',
								enum: Object.values(AccessLevel),
								example: AccessLevel.USER,
							},
							status: {
								type: 'string',
								enum: Object.values(AccountStatus),
								example: AccountStatus.ACTIVE,
							},
							userref: { type: 'string', example: 'USR123456' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
							profile: {
								type: 'object',
								properties: {
									height: { type: 'string', example: '180cm' },
									weight: { type: 'string', example: '75kg' },
									gender: { type: 'string', example: 'MALE' },
								},
							},
							employmentProfile: {
								type: 'object',
								properties: {
									position: { type: 'string', example: 'Senior Software Engineer' },
									department: { type: 'string', example: 'ENGINEERING' },
								},
							},
						},
					},
				},
				message: { type: 'string', example: 'Success' },
				meta: {
					type: 'object',
					properties: {
						total: { type: 'number', example: 50 },
						page: { type: 'number', example: 1 },
						limit: { type: 'number', example: 10 },
						totalPages: { type: 'number', example: 5 },
					},
				},
			},
		},
	})
	findAll(
		@Req() req: AuthenticatedRequest,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Query('status') status?: AccountStatus,
		@Query('accessLevel') accessLevel?: AccessLevel,
		@Query('search') search?: string,
		@Query('branchId') branchId?: number,
		@Query('organisationId') organisationId?: number,
	) {
		const orgId = req.user?.org?.uid;
		const userBranchId = req.user?.branch?.uid;
		
		const filters = {
			...(status && { status }),
			...(accessLevel && { accessLevel }),
			...(search && { search }),
			...(branchId && { branchId: Number(branchId) }),
			...(organisationId && { organisationId: Number(organisationId) }),
			orgId,
			userBranchId
		};

		return this.userService.findAll(
			filters,
			page ? Number(page) : 1,
			limit ? Number(limit) : Number(process.env.DEFAULT_PAGE_LIMIT),
		);
	}

	@Get(':ref')
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
		summary: 'Get a user by reference code',
		description:
			'Retrieves a user by reference code. Accessible by all authenticated users.',
	})
	@ApiParam({
		name: 'ref',
		description: 'User reference code',
		type: 'number',
		example: 1,
	})
	@ApiOkResponse({
		description: 'User found',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						uid: { type: 'number', example: 1 },
						username: { type: 'string', example: 'brandon123' },
						name: { type: 'string', example: 'Brandon' },
						surname: { type: 'string', example: 'Nkawu' },
						email: { type: 'string', example: 'brandon@loro.co.za' },
						phone: { type: 'string', example: '+27 64 123 4567' },
						photoURL: { type: 'string', example: 'https://example.com/photo.jpg' },
						accessLevel: { type: 'string', enum: Object.values(AccessLevel), example: AccessLevel.USER },
						status: { type: 'string', enum: Object.values(AccountStatus), example: AccountStatus.ACTIVE },
						userref: { type: 'string', example: 'USR123456' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						profile: {
							type: 'object',
							properties: {
								height: { type: 'string', example: '180cm' },
								weight: { type: 'string', example: '75kg' },
								gender: { type: 'string', example: 'MALE' },
							},
						},
						employmentProfile: {
							type: 'object',
							properties: {
								position: { type: 'string', example: 'Senior Software Engineer' },
								department: { type: 'string', example: 'ENGINEERING' },
							},
						},
					},
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	findOne(@Param('ref') ref: number, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.userService.findOne(ref, orgId, branchId);
	}

	@Patch(':ref')
	@ApiOperation({
		summary: 'Update a user by reference code',
		description: 'Updates a user by reference code. Accessible by users with appropriate roles.',
	})
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiParam({
		name: 'ref',
		description: 'Reference code',
		type: 'number',
		example: 1,
	})
	@ApiBody({ type: UpdateUserDto })
	@ApiOkResponse({
		description: 'User updated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	@ApiBadRequestResponse({ description: 'Invalid input data provided' })
	update(@Param('ref') ref: number, @Body() updateUserDto: UpdateUserDto, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.userService.update(ref, updateUserDto, orgId, branchId);
	}

	@Patch('restore/:ref')
	@ApiOperation({
		summary: 'Restore a deleted user by reference code',
		description: 'Restores a previously deleted user. Accessible by users with appropriate roles.',
	})
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
	@ApiParam({
		name: 'ref',
		description: 'User reference code',
		type: 'number',
		example: 1,
	})
	@ApiOkResponse({
		description: 'User restored successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	restore(@Param('ref') ref: number, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.userService.restore(ref, orgId, branchId);
	}

	@Delete(':ref')
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
		summary: 'Soft delete a user by reference code',
		description: 'Performs a soft delete on a user. Accessible by users with appropriate roles.',
	})
	@ApiParam({
		name: 'ref',
		description: 'User reference code',
		type: 'string',
		example: 'USR123456',
	})
	@ApiOkResponse({
		description: 'User deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	remove(@Param('ref') ref: number, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.userService.remove(ref, orgId, branchId);
	}

	@Get(':ref/target')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.OWNER,
	)
	@ApiOperation({
		summary: 'Get user targets',
		description: 'Get performance targets for a specific user',
	})
	@ApiParam({ name: 'ref', description: 'User ID', type: Number })
	@ApiOkResponse({
		description: 'User target data retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				userTarget: {
					type: 'object',
					properties: {
						id: { type: 'number', example: 1 },
						targetSalesAmount: { type: 'number', example: 50000 },
						targetCurrency: { type: 'string', example: 'USD' },
						targetHoursWorked: { type: 'number', example: 160 },
						targetNewClients: { type: 'number', example: 5 },
						targetNewLeads: { type: 'number', example: 20 },
						targetCheckIns: { type: 'number', example: 15 },
						targetCalls: { type: 'number', example: 50 },
						targetPeriod: { type: 'string', example: 'monthly' },
						periodStartDate: { type: 'string', format: 'date-time' },
						periodEndDate: { type: 'string', format: 'date-time' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
					},
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	getUserTarget(@Param('ref') ref: number) {
		return this.userService.getUserTarget(ref);
	}

	@Post(':ref/target')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.OWNER,
	)
	@ApiOperation({
		summary: 'Set user targets',
		description: 'Set performance targets for a specific user',
	})
	@ApiParam({ name: 'ref', description: 'User ID', type: Number })
	@ApiBody({ type: CreateUserTargetDto })
	@ApiCreatedResponse({
		description: 'User targets set successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'User targets set successfully' },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid input data provided' })
	@ApiNotFoundResponse({ description: 'User not found' })
	setUserTarget(@Param('ref') ref: number, @Body() createUserTargetDto: CreateUserTargetDto) {
		return this.userService.setUserTarget(ref, createUserTargetDto);
	}

	@Patch(':ref/target')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.OWNER,
	)
	@ApiOperation({
		summary: 'Update user targets',
		description: 'Update performance targets for a specific user',
	})
	@ApiParam({ name: 'ref', description: 'User ID', type: Number })
	@ApiBody({ type: UpdateUserTargetDto })
	@ApiOkResponse({
		description: 'User targets updated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'User targets updated successfully' },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid input data provided' })
	@ApiNotFoundResponse({ description: 'User not found or no targets set' })
	updateUserTarget(@Param('ref') ref: number, @Body() updateUserTargetDto: UpdateUserTargetDto) {
		return this.userService.updateUserTarget(ref, updateUserTargetDto);
	}

	@Delete(':ref/target')
	@Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.OWNER,
	)
	@ApiOperation({
		summary: 'Delete user targets',
		description: 'Delete performance targets for a specific user',
	})
	@ApiParam({ name: 'ref', description: 'User ID', type: Number })
	@ApiOkResponse({
		description: 'User targets deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'User targets deleted successfully' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	deleteUserTarget(@Param('ref') ref: number) {
		return this.userService.deleteUserTarget(ref);
	}
}
