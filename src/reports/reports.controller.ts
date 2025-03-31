import { Controller, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportParamsDto } from './dto/report-params.dto';
import { ReportType } from './constants/report-types.enum';
import { AuthenticatedRequest } from '../lib/interfaces/authenticated-request.interface';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiTags,
	ApiParam,
	ApiBody,
	ApiOkResponse,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';

@ApiBearerAuth('JWT-auth')
@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	// Unified endpoint for all report types
	@Post(':type/generate')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER, AccessLevel.OWNER)
	@ApiOperation({
		summary: 'Generate a comprehensive report',
		description:
			'Generates a detailed report based on the specified type and parameters. Available types: main, user, shift, quotation',
	})
	@ApiParam({
		name: 'type',
		description: 'Report type (main, user, shift, quotation)',
		enum: ['main', 'user', 'shift', 'quotation'],
		example: 'main',
	})
	@ApiBody({
		description: 'Report generation parameters',
		schema: {
			type: 'object',
			properties: {
				organisationId: {
					type: 'number',
					description: 'Organization ID (optional if available from auth context)',
				},
				branchId: {
					type: 'number',
					description: 'Branch ID (optional)',
				},
				name: {
					type: 'string',
					description: 'Report name (optional)',
				},
				startDate: {
					type: 'string',
					description: 'Start date for report data (YYYY-MM-DD)',
					example: '2023-01-01',
				},
				endDate: {
					type: 'string',
					description: 'End date for report data (YYYY-MM-DD)',
					example: '2023-12-31',
				},
				filters: {
					type: 'object',
					description: 'Additional filters for the report',
					example: {
						status: 'active',
						category: 'sales',
						clientId: 123,
					},
				},
			},
		},
	})
	@ApiOkResponse({
		description: 'Report generated successfully',
		schema: {
			type: 'object',
			properties: {
				metadata: {
					type: 'object',
					properties: {
						organisationId: { type: 'number' },
						branchId: { type: 'number' },
						generatedAt: { type: 'string', format: 'date-time' },
						type: { type: 'string', enum: ['main', 'user', 'shift', 'quotation'] },
						name: { type: 'string' },
					},
				},
				summary: {
					type: 'object',
					description: 'Summary statistics from the report',
				},
				metrics: {
					type: 'object',
					description: 'Various metrics calculated from the report data',
				},
				data: {
					type: 'object',
					description: 'Raw entity data from the database',
				},
				fromCache: {
					type: 'boolean',
					description: 'Indicates if the report was served from cache',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid parameters',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid report type or missing required parameters' },
			},
		},
	})
	async generateReport(
		@Param('type') type: string,
		@Body()
		reportParams: {
			organisationId?: number;
			branchId?: number;
			name?: string;
			startDate?: string;
			endDate?: string;
			filters?: Record<string, any>;
		},
		@Req() request: AuthenticatedRequest,
	) {
		// Validate report type
		if (!Object.values(ReportType).includes(type as ReportType)) {
			throw new BadRequestException(
				`Invalid report type: ${type}. Valid types are: ${Object.values(ReportType).join(', ')}`,
			);
		}

		// Use organization ID from authenticated request if not provided
		const orgId = reportParams.organisationId || request.user.org?.uid || request.user.organisationRef;

		if (!orgId) {
			throw new BadRequestException(
				'Organisation ID is required. Either specify it in the request body or it must be available in the authentication context.',
			);
		}

		// Use branch ID from authenticated request if not provided
		const brId = reportParams.branchId || request.user.branch?.uid;

		// Build params object
		const params: ReportParamsDto = {
			type: type as ReportType,
			organisationId: orgId,
			branchId: brId,
			name: reportParams.name,
			dateRange:
				reportParams.startDate && reportParams.endDate
					? {
							start: new Date(reportParams.startDate),
							end: new Date(reportParams.endDate),
					  }
					: undefined,
			filters: reportParams.filters,
		};

		// Generate the report
		return this.reportsService.generateReport(params, request.user);
	}

	// Specific endpoint for client quotation reports
	@Post('client/:clientId/quotations')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER, AccessLevel.OWNER, AccessLevel.CLIENT)
	@ApiOperation({
		summary: 'Generate a client quotation report',
		description: 'Generates a detailed report of quotations for a specific client',
	})
	@ApiParam({
		name: 'clientId',
		description: 'Client ID',
		example: 123,
	})
	@ApiBody({
		description: 'Report generation parameters',
		schema: {
			type: 'object',
			properties: {
				name: {
					type: 'string',
					description: 'Report name (optional)',
				},
				startDate: {
					type: 'string',
					description: 'Start date for report data (YYYY-MM-DD)',
					example: '2023-01-01',
				},
				endDate: {
					type: 'string',
					description: 'End date for report data (YYYY-MM-DD)',
					example: '2023-12-31',
				},
				additionalFilters: {
					type: 'object',
					description: 'Additional filters for the report',
					example: {
						status: 'approved',
					},
				},
			},
		},
	})
	@ApiOkResponse({
		description: 'Client quotation report generated successfully',
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid parameters',
	})
	async generateClientQuotationReport(
		@Param('clientId') clientId: number,
		@Body()
		reportParams: {
			name?: string;
			startDate?: string;
			endDate?: string;
			additionalFilters?: Record<string, any>;
		},
		@Req() request: AuthenticatedRequest,
	) {
		// Use organization ID from authenticated request
		const orgId = request.user.org?.uid || request.user.organisationRef;

		if (!orgId) {
			throw new BadRequestException('Organisation ID must be available in the authentication context.');
		}

		// Get branch ID from authenticated request if available
		const brId = request.user.branch?.uid;

		// For client users, extract client data from JWT token
		// Looking at the client-auth.service.ts, we need to extract client info
		const authHeader = request.headers.authorization;

		let requestingClientId = Number(clientId);

		if (authHeader) {
			const token = authHeader.split(' ')[1];
			try {
				const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

				// For CLIENT role, we need to ensure they're accessing their own data
				if (decodedToken.role === AccessLevel.CLIENT) {
					// The token might contain client info in different ways
					// Check all possibilities
					if (decodedToken.clientId) {
						requestingClientId = Number(decodedToken.clientId);
					} else if (decodedToken.client && decodedToken.client.uid) {
						requestingClientId = Number(decodedToken.client.uid);
					} else {
						// If we can't find client ID in token, use the UID as fallback
						// This assumes UID might be related to client
					}
				} else {
					// For non-client users, use the clientId from the URL
				}
			} catch (error) {}
		}

		// Build params object for the quotation report
		const params: ReportParamsDto = {
			type: ReportType.QUOTATION,
			organisationId: orgId,
			branchId: brId,
			name: reportParams.name || 'Client Quotation Report',
			dateRange:
				reportParams.startDate && reportParams.endDate
					? {
							start: new Date(reportParams.startDate),
							end: new Date(reportParams.endDate),
					  }
					: undefined,
			filters: {
				clientId: requestingClientId,
				...reportParams.additionalFilters,
			},
		};

		// Generate the report
		return this.reportsService.generateReport(params, request.user);
	}
}
