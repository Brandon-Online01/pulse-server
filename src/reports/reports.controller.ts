import { Controller, Post, Body, Param, Get, UseGuards, Req, BadRequestException, Logger } from '@nestjs/common';
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
	private readonly logger = new Logger(ReportsController.name);

	constructor(private readonly reportsService: ReportsService) {}

	// Add helper function to add random offset to coordinates
	private addRandomOffset(coord: number): number {
		// Add a larger random offset (±0.04 which is roughly 4-5 kilometers)
		return coord + (Math.random() - 0.5) * 0.08;
	}

	// Track all used coordinates to prevent duplicates
	private usedCoordinates: Set<string> = new Set();

	// Generate unique coordinates
	private getUniqueCoordinates(baseCoords: number[]): number[] {
		let lat = this.addRandomOffset(baseCoords[0]);
		let lng = this.addRandomOffset(baseCoords[1]);
		let coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;

		// If coordinates are already used, regenerate with larger offsets until unique
		let attempts = 0;
		while (this.usedCoordinates.has(coordKey) && attempts < 10) {
			// Increase the offset range as we make more attempts
			const offsetMultiplier = 1 + attempts * 1.5;
			lat = baseCoords[0] + (Math.random() - 0.5) * 0.08 * offsetMultiplier;
			lng = baseCoords[1] + (Math.random() - 0.5) * 0.08 * offsetMultiplier;
			coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
			attempts++;
		}

		// Store the unique coordinates
		this.usedCoordinates.add(coordKey);
		return [lat, lng];
	}

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
	@Get('client/:clientId')
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

	// Dedicated endpoint for map data
	@Get('map-data')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER, AccessLevel.OWNER)
	@ApiOperation({
		summary: 'Get map data',
		description: 'Retrieves all location data for map visualization',
	})
	@ApiOkResponse({
		description: 'Map data retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						workers: { type: 'array', items: { type: 'object' } },
						clients: { type: 'array', items: { type: 'object' } },
						competitors: { type: 'array', items: { type: 'object' } },
						quotations: { type: 'array', items: { type: 'object' } },
						events: { type: 'array', items: { type: 'object' } },
						mapConfig: {
							type: 'object',
							properties: {
								defaultCenter: { type: 'object' },
								orgRegions: { type: 'array', items: { type: 'object' } },
							},
						},
					},
				},
				summary: {
					type: 'object',
					description: 'Summary statistics of the map data',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid parameters',
	})
	async getMapData(@Req() request: AuthenticatedRequest) {
		// Use organization ID from authenticated request if not provided
		const orgId = request.user.org?.uid || request.user.organisationRef;

		if (!orgId) {
			throw new BadRequestException(
				'Organisation ID is required. Either specify it in the request query or it must be available in the authentication context.',
			);
		}

		// Mock data for map visualization
		// This can be commented out later when real data fetching is implemented
		const mockMapData = this.generateMockMapData();

		return {
			data: mockMapData,
			summary: {
				totalWorkers: mockMapData.workers.length,
				totalClients: mockMapData.clients.length,
				totalCompetitors: mockMapData.competitors.length,
				totalQuotations: mockMapData.quotations.length,
				totalEvents: mockMapData.events.length,
			},
		};
	}

	// Helper method to generate mock data for map visualization
	private generateMockMapData(): any {
		// Reset the set of used coordinates for each new map data generation
		this.usedCoordinates = new Set();

		// Generate mock data for the map
		return {
			workers: this.generateMockWorkers(),
			clients: this.generateMockClients(),
			competitors: this.generateMockCompetitors(),
			quotations: this.generateMockQuotations(),
			mapConfig: {
				defaultCenter: { lat: -26.2041, lng: 28.0473 }, // Center on Johannesburg
				orgRegions: [
					{
						name: 'Main Office',
						center: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
						zoom: 9,
					},
				],
			},
			events: this.generateMockEvents(),
		};
	}

	private generateMockWorkers(): any[] {
		const workerTypes = [
			'check-in',
			'shift-start',
			'shift-end',
			'lead',
			'journal',
			'task',
			'break-start',
			'break-end',
		];
		const statuses = ['Active', 'On Break', 'In Progress', 'Completed'];

		// Reduce number of cities but keep global distribution, focus on Africa
		const globalLocations = [
			// United States - just 2 major cities
			{ city: 'New York', coords: [40.7128, -74.006], address: 'Manhattan, New York, USA' },
			{ city: 'Los Angeles', coords: [34.0522, -118.2437], address: 'Downtown LA, California, USA' },

			// Europe - just 2 major cities
			{ city: 'London', coords: [51.5074, -0.1278], address: 'Westminster, London, UK' },
			{ city: 'Berlin', coords: [52.52, 13.405], address: 'Mitte, Berlin, Germany' },

			// Asia - just 2 major cities
			{ city: 'Tokyo', coords: [35.6762, 139.6503], address: 'Shinjuku, Tokyo, Japan' },
			{ city: 'Beijing', coords: [39.9042, 116.4074], address: 'Chaoyang District, Beijing, China' },

			// Australia - just 1 city
			{ city: 'Sydney', coords: [-33.8688, 151.2093], address: 'CBD, Sydney, Australia' },

			// Priority African locations
			{ city: 'Johannesburg', coords: [-26.2041, 28.0473], address: 'Sandton, Johannesburg, South Africa' },
			{ city: 'Cape Town', coords: [-33.9249, 18.4241], address: 'Waterfront, Cape Town, South Africa' },
			{ city: 'Lagos', coords: [6.5244, 3.3792], address: 'Victoria Island, Lagos, Nigeria' },
			{ city: 'Nairobi', coords: [-1.2864, 36.8172], address: 'Central Business District, Nairobi, Kenya' },
			{ city: 'Cairo', coords: [30.0444, 31.2357], address: 'Downtown, Cairo, Egypt' },
			{ city: 'Accra', coords: [5.6037, -0.187], address: 'Central Accra, Ghana' },
		];

		const workers = [];
		const locationImageUrl =
			'https://images.pexels.com/photos/31382339/pexels-photo-31382339/free-photo-of-facade-of-itaewon-jjajang-restaurant-at-night.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

		// Ensure all worker types are represented by distributing them evenly
		// Prioritize one worker type per African location
		workerTypes.forEach((workerType, i) => {
			// Choose a location, prioritizing African locations (7-12)
			const locationIndex = i < 6 ? i + 7 : i % globalLocations.length;
			const location = globalLocations[locationIndex];

			// Generate unique coordinates based on the location
			const uniquePosition = this.getUniqueCoordinates(location.coords);

			workers.push({
				id: 1000 + i,
				name: `Worker ${i + 1}`,
				position: uniquePosition,
				markerType: workerType,
				status: statuses[Math.floor(Math.random() * statuses.length)],
				image: `/avatar-${(i % 8) + 1}.jpg`,
				location: {
					address: `${location.city} - ${location.address}`,
					imageUrl: locationImageUrl,
				},
				canAddTask: Math.random() > 0.5,
				timeTracking: {
					checkInTime: new Date(new Date().setHours(8, 0, 0)).toISOString(),
					lastUpdate: new Date().toISOString(),
					totalTime: Math.floor(Math.random() * 480), // 0-8 hours in minutes
					rate: (Math.floor(Math.random() * 500) + 100).toFixed(2), // ZAR hourly rate
					currency: 'ZAR',
				},
			});
		});

		// Add a second worker to some locations, still ensuring sparse distribution
		for (let i = 0; i < 5; i++) {
			// Mainly add workers to African locations
			const locationIndex = i < 3 ? i + 7 : i % globalLocations.length;
			const location = globalLocations[locationIndex];

			// Generate unique coordinates
			const uniquePosition = this.getUniqueCoordinates(location.coords);

			const workerId = 1000 + workerTypes.length + i;
			workers.push({
				id: workerId,
				name: `Worker ${workerId - 999}`,
				position: uniquePosition,
				markerType: workerTypes[Math.floor(Math.random() * workerTypes.length)],
				status: statuses[Math.floor(Math.random() * statuses.length)],
				image: `/avatar-${(i % 8) + 1}.jpg`,
				location: {
					address: `${location.city} - ${location.address}`,
					imageUrl: locationImageUrl,
				},
				canAddTask: Math.random() > 0.5,
				timeTracking: {
					checkInTime: new Date(new Date().setHours(8, 0, 0)).toISOString(),
					lastUpdate: new Date().toISOString(),
					totalTime: Math.floor(Math.random() * 480), // 0-8 hours in minutes
					rate: (Math.floor(Math.random() * 500) + 100).toFixed(2), // ZAR hourly rate
					currency: 'ZAR',
				},
			});
		}

		return workers;
	}

	private generateMockClients(): any[] {
		// Reduced client locations with focus on Africa
		const globalLocations = [
			// North America - just 2 cities
			{ city: 'Toronto', coords: [43.6532, -79.3832], address: 'Downtown, Toronto, Canada' },
			{ city: 'New York', coords: [40.7128, -74.006], address: 'Manhattan, New York, USA' },

			// Europe - just 2 cities
			{ city: 'Berlin', coords: [52.52, 13.405], address: 'Mitte, Berlin, Germany' },
			{ city: 'London', coords: [51.5074, -0.1278], address: 'Westminster, London, UK' },

			// South Africa - priority
			{ city: 'Johannesburg', coords: [-26.2041, 28.0473], address: 'Sandton, Johannesburg, South Africa' },
			{ city: 'Cape Town', coords: [-33.9249, 18.4241], address: 'City Centre, Cape Town, South Africa' },
			{ city: 'Durban', coords: [-29.8587, 31.0218], address: 'City Centre, Durban, South Africa' },

			// Other African Countries
			{ city: 'Lagos', coords: [6.5244, 3.3792], address: 'Victoria Island, Lagos, Nigeria' },
			{ city: 'Nairobi', coords: [-1.2864, 36.8172], address: 'Westlands, Nairobi, Kenya' },
			{ city: 'Cairo', coords: [30.0444, 31.2357], address: 'Zamalek, Cairo, Egypt' },
			{ city: 'Accra', coords: [5.6037, -0.187], address: 'Airport Residential, Accra, Ghana' },
		];

		const locationImageUrl =
			'https://images.pexels.com/photos/31382339/pexels-photo-31382339/free-photo-of-facade-of-itaewon-jjajang-restaurant-at-night.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

		// Create one client per location, ensuring sparse distribution
		return globalLocations.map((location, i) => {
			// Check if this is an African location (index 4+ are African)
			const isAfrican = i >= 4;

			// Generate unique coordinates with larger spread
			const uniquePosition = this.getUniqueCoordinates(location.coords);

			return {
				id: 2000 + i,
				name: `Client Corp ${i + 1}`,
				position: uniquePosition,
				markerType: 'client',
				status: 'Active',
				clientRef: `CL-${2000 + i}`,
				contact: {
					name: `Client Contact ${i + 1}`,
					email: `client${i + 1}@example.com`,
					phone: `+${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${
						Math.floor(Math.random() * 9000) + 1000
					}`,
				},
				address: `${location.address}`,
				category: ['Premium', 'Standard', 'Basic'][Math.floor(Math.random() * 3)],
				// Use the same image for all locations
				locationImage: locationImageUrl,
				// Add yearly revenue in ZAR
				financials: {
					yearlyRevenue: (Math.floor(Math.random() * 10000000) + 1000000).toFixed(2),
					currency: 'ZAR',
					contractValue: (Math.floor(Math.random() * 500000) + 50000).toFixed(2),
				},
			};
		});
	}

	private generateMockCompetitors(): any[] {
		// Reduced competitor locations with focus on Africa
		const globalLocations = [
			// Asia - just 2 cities
			{ city: 'Shanghai', coords: [31.2304, 121.4737], address: 'Pudong District, Shanghai, China' },
			{ city: 'Tokyo', coords: [35.6762, 139.6503], address: 'Shinjuku, Tokyo, Japan' },

			// Europe - just 2 cities
			{ city: 'Madrid', coords: [40.4168, -3.7038], address: 'Sol, Madrid, Spain' },
			{ city: 'Paris', coords: [48.8566, 2.3522], address: 'Le Marais, Paris, France' },

			// African Locations - priority
			{ city: 'Johannesburg', coords: [-26.1945, 28.0287], address: 'Rosebank, Johannesburg, South Africa' },
			{ city: 'Cape Town', coords: [-33.9258, 18.4232], address: 'Gardens, Cape Town, South Africa' },
			{ city: 'Lagos', coords: [6.4281, 3.4267], address: 'Lekki, Lagos, Nigeria' },
			{ city: 'Nairobi', coords: [-1.2921, 36.8219], address: 'Karen, Nairobi, Kenya' },
			{ city: 'Cairo', coords: [30.0566, 31.2262], address: 'Maadi, Cairo, Egypt' },
			{ city: 'Accra', coords: [5.6037, -0.187], address: 'Airport Residential, Accra, Ghana' },
		];

		const locationImageUrl =
			'https://images.pexels.com/photos/31382339/pexels-photo-31382339/free-photo-of-facade-of-itaewon-jjajang-restaurant-at-night.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

		// Create one competitor per location, ensuring sparse distribution
		return globalLocations.map((location, i) => {
			// Check if this is an African location (index 4+ are African)
			const isAfrican = i >= 4;

			// Generate unique coordinates with larger spread
			const uniquePosition = this.getUniqueCoordinates(location.coords);

			return {
				id: 3000 + i,
				name: `Competitor Inc ${i + 1}`,
				position: uniquePosition,
				markerType: 'competitor',
				status: 'Active',
				competitorRef: `CP-${3000 + i}`,
				competitorStrength: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
				notes: `Competitor ${i + 1} market analysis for ${location.city}.`,
				// Use the same image for all locations
				locationImage: locationImageUrl,
				// Add market share and revenue in ZAR
				marketData: {
					marketShare: (Math.floor(Math.random() * 30) + 5).toFixed(2) + '%',
					estimatedRevenue: (Math.floor(Math.random() * 5000000) + 500000).toFixed(2),
					currency: 'ZAR',
				},
			};
		});
	}

	private generateMockQuotations(): any[] {
		const statuses = ['pending', 'approved', 'rejected'];

		// Reduced quotation locations with focus on Africa
		const globalLocations = [
			// Middle East - just 1 city
			{ city: 'Dubai', coords: [25.2048, 55.2708], address: 'Downtown, Dubai, UAE' },

			// Asia - just 1 city
			{ city: 'Singapore', coords: [1.3521, 103.8198], address: 'Marina Bay, Singapore' },

			// Priority African locations
			{ city: 'Johannesburg', coords: [-26.1052, 28.056], address: 'Fourways, Johannesburg, South Africa' },
			{ city: 'Cape Town', coords: [-33.9062, 18.4131], address: 'Sea Point, Cape Town, South Africa' },
			{ city: 'Lagos', coords: [6.4698, 3.5852], address: 'Ajah, Lagos, Nigeria' },
			{ city: 'Nairobi', coords: [-1.3031, 36.7073], address: 'Lavington, Nairobi, Kenya' },
			{ city: 'Cairo', coords: [30.0771, 31.0175], address: '6th of October City, Cairo, Egypt' },
			{ city: 'Accra', coords: [5.6037, -0.1546], address: 'East Legon, Accra, Ghana' },

			// Europe - just 1 city
			{ city: 'Stockholm', coords: [59.3293, 18.0686], address: 'Norrmalm, Stockholm, Sweden' },
		];

		// Create one quotation per location, ensuring sparse distribution
		return globalLocations.map((location, i) => {
			// Generate unique coordinates with larger spread
			const uniquePosition = this.getUniqueCoordinates(location.coords);

			return {
				id: 4000 + i,
				quotationNumber: `QT-${2023}-${4000 + i}`,
				clientName: `Client Corp ${i + 1}`,
				position: uniquePosition,
				markerType: 'quotation',
				status: statuses[Math.floor(Math.random() * statuses.length)],
				quotationDate: new Date(
					new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30)),
				).toISOString(),
				validUntil: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
				totalAmount: (Math.floor(Math.random() * 100000) + 10000).toFixed(2), // ZAR amounts (higher values)
				currency: 'ZAR', // Specify ZAR currency
				placedBy: `Sales Agent ${(i % 5) + 1}`,
			};
		});
	}

	private generateMockEvents(): any[] {
		const eventTypes = [
			'check-in',
			'task-completed',
			'new-lead',
			'client-visit',
			'break-start',
			'break-end',
			'shift-start',
			'shift-end',
		];

		// Greatly reduced locations, focusing on major cities with only 2 events per city
		const allLocations = [
			// One city per continent outside Africa
			{ lat: 40.7128, lng: -74.006, address: 'Manhattan, New York, USA' },
			{ lat: 51.5074, lng: -0.1278, address: 'Westminster, London, UK' },
			{ lat: 35.6762, lng: 139.6503, address: 'Shinjuku, Tokyo, Japan' },
			{ lat: -33.8688, lng: 151.2093, address: 'CBD, Sydney, Australia' },
			{ lat: -22.9068, lng: -43.1729, address: 'Copacabana, Rio de Janeiro, Brazil' },

			// Priority African locations
			{ lat: -26.2041, lng: 28.0473, address: 'Sandton, Johannesburg, South Africa' },
			{ lat: -33.9249, lng: 18.4241, address: 'City Centre, Cape Town, South Africa' },
			{ lat: 6.5244, lng: 3.3792, address: 'Victoria Island, Lagos, Nigeria' },
			{ lat: -1.2864, lng: 36.8172, address: 'Central Business District, Nairobi, Kenya' },
			{ lat: 30.0444, lng: 31.2357, address: 'Downtown, Cairo, Egypt' },
			{ lat: 5.6037, lng: -0.187, address: 'Central Accra, Ghana' },
		];

		const locationImageUrl =
			'https://images.pexels.com/photos/31382339/pexels-photo-31382339/free-photo-of-facade-of-itaewon-jjajang-restaurant-at-night.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
		const events = [];

		// Create exactly two events per location, ensuring a variety of event types
		allLocations.forEach((location, locIndex) => {
			// For each location, create two events of different types
			for (let i = 0; i < 2; i++) {
				// Ensure even distribution of event types across locations
				const eventType = eventTypes[(locIndex * 2 + i) % eventTypes.length];
				const timestamp = new Date(
					new Date().setMinutes(new Date().getMinutes() - (locIndex * 2 + i) * 30),
				).toISOString();

				// Generate unique coordinates with larger spread
				const uniqueCoords = this.getUniqueCoordinates([location.lat, location.lng]);

				events.push({
					id: 5000 + events.length,
					type: eventType,
					userId: 1000 + Math.floor(Math.random() * 13), // Match with our reduced set of workers
					userName: `Worker ${Math.floor(Math.random() * 13) + 1}`,
					timestamp,
					location: {
						lat: uniqueCoords[0],
						lng: uniqueCoords[1],
						address: location.address,
						// Use the same image URL for all event types
						imageUrl: locationImageUrl,
					},
					details: this.generateEventDetails(eventType, events.length),
					markerType: eventType,
					// Add transaction amount in ZAR for financial events
					...(eventType === 'new-lead'
						? {
								amount: (Math.floor(Math.random() * 50000) + 5000).toFixed(2),
								currency: 'ZAR',
						  }
						: {}),
				});
			}
		});

		return events;
	}

	private generateEventDetails(eventType: string, index: number): string {
		switch (eventType) {
			case 'check-in':
				return `Daily check-in at office location #${(index % 10) + 1}`;
			case 'task-completed':
				return `Completed task: ${
					['Maintenance', 'Delivery', 'Meeting', 'Inspection', 'Training'][index % 5]
				} #${index}`;
			case 'new-lead':
				return `New lead captured: Potential ${['Premium', 'Standard', 'Basic'][index % 3]} client`;
			case 'client-visit':
				return `Visited client: Client Corp ${(index % 20) + 1}`;
			case 'break-start':
				return `Started a ${[15, 30, 45, 60][index % 4]}-minute break`;
			case 'break-end':
				return `Ended break, returning to work`;
			case 'shift-start':
				return `Started ${['Morning', 'Day', 'Evening', 'Night'][index % 4]} shift`;
			case 'shift-end':
				return `Ended ${['Morning', 'Day', 'Evening', 'Night'][index % 4]} shift`;
			default:
				return `Event ${index + 1} details`;
		}
	}

	@Post('daily-report/:userId')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER)
	@ApiOperation({
		summary: 'Generate a daily report for a specific user',
		description: 'Generates and sends a daily activity report for a specific user',
	})
	@ApiParam({
		name: 'userId',
		description: 'ID of the user to generate report for',
		type: 'number',
	})
	@ApiOkResponse({
		description: 'Report generated and sent successfully',
		schema: {
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				reportId: { type: 'number' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid user ID',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
	})
	async generateDailyReportForUser(@Param('userId') userId: number, @Req() request: AuthenticatedRequest) {
		try {
			// Validate userId
			if (!userId || isNaN(Number(userId))) {
				throw new BadRequestException('Valid user ID is required');
			}

			// Create report parameters with the organization from the request context
			const params: ReportParamsDto = {
				type: ReportType.USER_DAILY,
				organisationId: request.user.organisationRef || request.user.org?.uid,
				filters: {
					userId: Number(userId),
				},
			};

			// Generate and send report
			const report = await this.reportsService.generateUserDailyReport(params);

			return {
				success: true,
				message: `Daily report generated and sent successfully`,
				reportId: report.uid,
			};
		} catch (error) {
			this.logger.error(`Error generating manual daily report: ${error.message}`, error.stack);
			throw error;
		}
	}

	@Get('live-overview')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER, AccessLevel.OWNER)
	@ApiOperation({
		summary: 'Generate a live organizational overview report',
		description: 'Generates a real-time report of organizational metrics and KPIs',
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
				forceFresh: {
					type: 'boolean',
					description: 'Force a fresh report generation, bypassing cache (optional)',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid parameters',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Organisation ID is required' },
			},
		},
	})
	async generateLiveOverviewReport(
		@Body()
		reportParams: {
			organisationId?: number;
			branchId?: number;
			name?: string;
			forceFresh?: boolean;
		},
		@Req() request: AuthenticatedRequest,
	) {
		try {
			// Use organization ID from authenticated request if not provided
			const orgId = reportParams.organisationId || request.user.org?.uid || request.user.organisationRef;

			if (!orgId) {
				throw new BadRequestException(
					'Organisation ID is required. Either specify it in the request body or it must be available in the authentication context.',
				);
			}

			// Use branch ID from authenticated request if not provided
			const brId = reportParams.branchId || request.user.branch?.uid;

			// Build params object for the live overview report
			const params: ReportParamsDto = {
				type: ReportType.LIVE_OVERVIEW,
				organisationId: orgId,
				branchId: brId,
				name: reportParams.name || 'Live Organization Overview',
				filters: {
					forceFresh: reportParams.forceFresh || false,
				},
			};

			// Generate the report
			return this.reportsService.generateReport(params, request.user);
		} catch (error) {
			this.logger.error(`Error generating live overview report: ${error.message}`, error.stack);
			throw error;
		}
	}
}
