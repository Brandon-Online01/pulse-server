import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Request,
	DefaultValuePipe,
	ParseIntPipe,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiTags,
	ApiQuery,
	ApiParam,
	ApiOkResponse,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CompetitorsService } from './competitors.service';
import { CreateCompetitorDto } from './dto/create-competitor.dto';
import { UpdateCompetitorDto } from './dto/update-competitor.dto';
import { FilterCompetitorDto } from './dto/filter-competitor.dto';
import { Competitor } from './entities/competitor.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { PaginatedResponse } from '../lib/interfaces/paginated-response.interface';
import { CompetitorStatus } from '../lib/enums/competitor.enums';

@ApiTags('competitors')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('competitors')
@EnterpriseOnly('competitors')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class CompetitorsController {
	constructor(private readonly competitorsService: CompetitorsService) {}

	@Post()
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	@ApiOperation({ summary: 'Create a new competitor' })
	@ApiCreatedResponse({
		description: 'The competitor has been successfully created.',
		type: Competitor,
	})
	@ApiBadRequestResponse({ description: 'Bad request.' })
	create(@Body() createCompetitorDto: CreateCompetitorDto, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.create(createCompetitorDto, req.user, orgId, branchId);
	}

	@Get()
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Get all competitors',
		description: 'Retrieves a paginated list of all competitors with optional filtering',
	})
	@ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' })
	@ApiQuery({
		name: 'limit',
		type: Number,
		required: false,
		description: 'Number of records per page, defaults to system setting',
	})
	@ApiQuery({ name: 'status', enum: CompetitorStatus, required: false, description: 'Filter by competitor status' })
	@ApiQuery({ name: 'isDirect', type: Boolean, required: false, description: 'Filter by direct competitor status' })
	@ApiQuery({ name: 'industry', type: String, required: false, description: 'Filter by industry' })
	@ApiQuery({ name: 'name', type: String, required: false, description: 'Filter by name (partial match)' })
	@ApiQuery({
		name: 'minThreatLevel',
		type: Number,
		required: false,
		description: 'Filter by minimum threat level (1-5)',
	})
	@ApiOkResponse({
		description: 'List of competitors retrieved successfully',
		type: Object,
	})
	findAll(
		@Query() filterDto: FilterCompetitorDto,
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
		@Request() req?: any,
	): Promise<PaginatedResponse<Competitor>> {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.findAll(filterDto, page, limit, orgId, branchId);
	}

	@Get('analytics')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	@ApiOperation({ summary: 'Get competitor analytics' })
	@ApiOkResponse({
		description: 'Return competitor analytics',
		schema: {
			type: 'object',
			properties: {
				totalCompetitors: { type: 'number' },
				directCompetitors: { type: 'number' },
				indirectCompetitors: { type: 'number' },
				averageThreatLevel: { type: 'number' },
				topThreats: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							uid: { type: 'number' },
							name: { type: 'string' },
							threatLevel: { type: 'number' },
							industry: { type: 'string' },
						},
					},
				},
				byIndustry: {
					type: 'object',
					additionalProperties: { type: 'number' },
				},
			},
		},
	})
	getCompetitorAnalytics(@Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.getCompetitorAnalytics(orgId, branchId);
	}

	@Get('by-industry')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	@ApiOperation({ summary: 'Get competitors grouped by industry' })
	@ApiOkResponse({
		description: 'Return competitors grouped by industry',
		schema: {
			type: 'object',
			additionalProperties: { type: 'number' },
		},
	})
	getCompetitorsByIndustry(@Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.getCompetitorsByIndustry(orgId, branchId);
	}

	@Get('by-threat')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	@ApiOperation({ summary: 'Get competitors by threat level' })
	@ApiQuery({ name: 'minThreatLevel', required: false, type: Number, description: 'Minimum threat level (1-5)' })
	@ApiOkResponse({
		description: 'Return competitors ordered by threat level',
		type: [Competitor],
	})
	findByThreatLevel(
		@Query('minThreatLevel', new DefaultValuePipe(0), ParseIntPipe) minThreatLevel = 0,
		@Request() req,
	) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.findByThreatLevel(minThreatLevel, orgId, branchId);
	}

	@Get('by-name')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
	@ApiOperation({ summary: 'Find competitors by name' })
	@ApiQuery({ name: 'name', required: true, type: String, description: 'Competitor name (partial match)' })
	@ApiOkResponse({
		description: 'Return competitors matching name',
		type: [Competitor],
	})
	findByName(@Query('name') name: string, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.findByName(name, orgId, branchId);
	}

	@Get(':id')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
	@ApiOperation({ summary: 'Get competitor by id' })
	@ApiParam({ name: 'id', description: 'Competitor ID' })
	@ApiOkResponse({
		description: 'Return the competitor',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				competitor: { type: 'object', nullable: true },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'Competitor not found.' })
	findOne(@Param('id') id: string, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.findOne(+id, orgId, branchId);
	}

	@Get('ref/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
	@ApiOperation({ summary: 'Get competitor by reference code' })
	@ApiParam({ name: 'ref', description: 'Competitor reference code' })
	@ApiOkResponse({
		description: 'Return the competitor',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				competitor: { type: 'object', nullable: true },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'Competitor not found.' })
	findOneByRef(@Param('ref') ref: string, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.findOneByRef(ref, orgId, branchId);
	}

	@Patch(':id')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	@ApiOperation({ summary: 'Update competitor' })
	@ApiParam({ name: 'id', description: 'Competitor ID' })
	@ApiOkResponse({
		description: 'The competitor has been successfully updated.',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				competitor: { type: 'object' },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Bad request.' })
	@ApiNotFoundResponse({ description: 'Competitor not found.' })
	update(@Param('id') id: string, @Body() updateCompetitorDto: UpdateCompetitorDto, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.update(+id, updateCompetitorDto, orgId, branchId);
	}

	@Delete(':id')
	@Roles(AccessLevel.ADMIN)
	@ApiOperation({ summary: 'Delete competitor (soft delete)' })
	@ApiParam({ name: 'id', description: 'Competitor ID' })
	@ApiOkResponse({
		description: 'The competitor has been successfully soft-deleted.',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'Competitor not found.' })
	remove(@Param('id') id: string, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.remove(+id, orgId, branchId);
	}

	@Delete(':id/hard')
	@Roles(AccessLevel.ADMIN)
	@ApiOperation({ summary: 'Hard delete competitor (permanent)' })
	@ApiParam({ name: 'id', description: 'Competitor ID' })
	@ApiOkResponse({
		description: 'The competitor has been permanently deleted.',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'Competitor not found.' })
	hardRemove(@Param('id') id: string, @Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		return this.competitorsService.hardRemove(+id, orgId, branchId);
	}

	@Get('map-data')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
	@ApiOperation({ summary: 'Get competitor data formatted for map display' })
	@ApiOkResponse({
		description: 'Return competitors with position data for map display',
		type: [Object],
	})
	getCompetitorsForMap(@Request() req) {
		const orgId = req.user?.org?.uid || req.user?.organisation?.uid || req.organization?.ref;
		const branchId = req.user?.branch?.uid || req.branch?.uid;

		const filters = { isDeleted: false };
		return this.competitorsService.findAll(filters, 1, 1000, orgId, branchId)
			.then(({ data }) => {
				// Transform data into map-friendly format with mock positions
				return data.map(competitor => {
					// Create position (mock for now - would use geocoding in production)
					const position = this.createMockPosition();
					
					return {
						id: competitor.uid,
						name: competitor.name,
						position,
						markerType: 'competitor',
						threatLevel: competitor.threatLevel || 0,
						isDirect: competitor.isDirect || false,
						industry: competitor.industry || 'Unknown',
						status: competitor.status,
						website: competitor.website,
						logoUrl: competitor.logoUrl,
						competitorRef: competitor.competitorRef,
						address: competitor.address
					};
				});
			});
	}

	// Helper method to create mock positions
	private createMockPosition(): [number, number] {
		// Generate a position around Johannesburg
		const defaultLat = -26.1278;
		const defaultLng = 28.0582;
		
		// Generate a slight random offset (±0.05 degrees, roughly ±5km)
		const latOffset = (Math.random() - 0.5) * 0.1;
		const lngOffset = (Math.random() - 0.5) * 0.1;
		
		return [defaultLat + latOffset, defaultLng + lngOffset];
	}
}
