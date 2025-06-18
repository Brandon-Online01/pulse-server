import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AuthenticatedRequest } from '../lib/interfaces/authenticated-request.interface';
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
	ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';
import { isPublic } from '../decorators/public.decorator';
import { Branch } from './entities/branch.entity';

@ApiBearerAuth('JWT-auth')
@ApiTags('branch')
@Controller('branch')
@UseGuards(AuthGuard, RoleGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class BranchController {
	constructor(private readonly branchService: BranchService) {}

	@Post()
	@isPublic()
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
		summary: 'Create a new branch',
		description: 'Creates a new branch with the provided details',
	})
	@ApiBody({ type: CreateBranchDto })
	@ApiCreatedResponse({
		description: 'Branch created successfully',
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
				message: { type: 'string', example: 'Error creating branch' },
			},
		},
	})
	create(@Body() createBranchDto: CreateBranchDto, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.branchService.create(createBranchDto, orgId, branchId);
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
		summary: 'Get all branches',
		description: 'Retrieves a list of all non-deleted branches',
	})
	@ApiOkResponse({
		description: 'Branches retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				branches: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							uid: { type: 'number' },
							name: { type: 'string' },
							email: { type: 'string' },
							phone: { type: 'string' },
							// Other branch properties
						},
					},
				},
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	findAll(@Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.branchService.findAll(orgId, branchId);
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
		summary: 'Get a branch by reference code',
		description: 'Retrieves detailed information about a specific branch including related entities',
	})
	@ApiParam({ name: 'ref', description: 'Branch reference code', type: 'string' })
	@ApiOkResponse({
		description: 'Branch details retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				branch: {
					type: 'object',
					properties: {
						uid: { type: 'number' },
						name: { type: 'string' },
						email: { type: 'string' },
						phone: { type: 'string' },
						// Other branch properties
					},
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
				branch: { type: 'null' },
			},
		},
	})
	findOne(@Param('ref') ref: string, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.branchService.findOne(ref, orgId, branchId);
	}

	@Patch(':ref')
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
		summary: 'Update a branch',
		description: 'Updates an existing branch with the provided information',
	})
	@ApiParam({ name: 'ref', description: 'Branch reference code', type: 'string' })
	@ApiBody({ type: UpdateBranchDto })
	@ApiOkResponse({
		description: 'Branch updated successfully',
		schema: {
			type: 'object',
			properties: {
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
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error updating branch' },
			},
		},
	})
	update(@Param('ref') ref: string, @Body() updateBranchDto: UpdateBranchDto, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.branchService.update(ref, updateBranchDto, orgId, branchId);
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
		summary: 'Soft delete a branch',
		description: 'Marks a branch as deleted without removing it from the database',
	})
	@ApiParam({ name: 'ref', description: 'Branch reference code', type: 'string' })
	@ApiOkResponse({
		description: 'Branch deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Branch not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error deleting branch' },
			},
		},
	})
	remove(@Param('ref') ref: string, @Req() req: AuthenticatedRequest) {
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;
		return this.branchService.remove(ref, orgId, branchId);
	}
}
