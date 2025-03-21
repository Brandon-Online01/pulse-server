import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository, DeepPartial, FindOptionsWhere, ILike } from 'typeorm';
import { GeneralStatus } from '../lib/enums/status.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckIn } from '../check-ins/entities/check-in.entity';

@Injectable()
export class ClientsService {
	private readonly CACHE_TTL: number;
	private readonly CACHE_PREFIX = 'clients:';

	constructor(
		@InjectRepository(Client)
		private clientsRepository: Repository<Client>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly configService: ConfigService,
		private readonly eventEmitter: EventEmitter2,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async invalidateClientCache(client: Client) {
		try {
			// Get all cache keys
			const keys = await this.cacheManager.store.keys();

			// Keys to clear
			const keysToDelete = [];

			// Add client-specific keys
			keysToDelete.push(
				this.getCacheKey(client.uid),
				this.getCacheKey(client.email),
				this.getCacheKey(client.name),
				`${this.CACHE_PREFIX}all`,
				`${this.CACHE_PREFIX}stats`,
			);

			// Add organization and branch specific keys
			if (client.organisation?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}org_${client.organisation.uid}`);
			}
			if (client.branch?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}branch_${client.branch.uid}`);
			}

			// Add status specific keys
			if (client.status) {
				keysToDelete.push(`${this.CACHE_PREFIX}status_${client.status}`);
			}

			// Add category specific keys
			if (client.category) {
				keysToDelete.push(`${this.CACHE_PREFIX}category_${client.category}`);
			}

			// Clear all pagination and filtered client list caches
			const clientListCaches = keys.filter(
				(key) =>
					key.startsWith(`${this.CACHE_PREFIX}page`) ||
					key.includes('_limit') ||
					key.includes('_filter') ||
					key.includes('search_'),
			);
			keysToDelete.push(...clientListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));

			// Emit event for other services that might be caching client data
			this.eventEmitter.emit('clients.cache.invalidate', {
				clientId: client.uid,
				keys: keysToDelete,
			});
		} catch (error) {
			console.error('Error invalidating client cache:', error);
		}
	}

	async create(createClientDto: CreateClientDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Add organization and branch
			const clientData = {
				...createClientDto,
				organisation: orgId ? { uid: orgId } : undefined,
				branch: branchId ? { uid: branchId } : undefined,
			} as DeepPartial<Client>;

			const client = await this.clientsRepository.save(clientData);

			if (!client) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			// Invalidate cache after creation
			await this.invalidateClientCache(client);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findAll(
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
		orgId?: number,
		branchId?: number,
		filters?: {
			status?: GeneralStatus;
			category?: string;
			search?: string;
		},
	): Promise<PaginatedResponse<Client>> {
		try {
			const cacheKey = `${
				this.CACHE_PREFIX
			}page${page}_limit${limit}_org${orgId}_branch${branchId}_${JSON.stringify(filters)}`;
			const cachedClients = await this.cacheManager.get<PaginatedResponse<Client>>(cacheKey);

			if (cachedClients) {
				return cachedClients;
			}

			// Create find options with relationships
			const where: FindOptionsWhere<Client> = { isDeleted: false };

			// Filter by organization and branch
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			if (filters?.status) {
				where.status = filters.status;
			}

			if (filters?.category) {
				where.category = filters.category;
			}

			if (filters?.search) {
				// Handle search across multiple fields
				return this.clientsBySearchTerm(filters.search, page, limit, orgId, branchId);
			}

			// Find clients with pagination
			const [clients, total] = await this.clientsRepository.findAndCount({
				where,
				skip: (page - 1) * limit,
				take: limit,
				order: { createdAt: 'DESC' },
			});

			if (!clients) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				data: clients,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};

			await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);

			return response;
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
				message: error?.message,
			};
		}
	}

	async findOne(ref: number, orgId?: number, branchId?: number): Promise<{ message: string; client: Client | null }> {
		try {
			const cacheKey = `${this.getCacheKey(ref)}_org${orgId}_branch${branchId}`;
			const cachedClient = await this.cacheManager.get<Client>(cacheKey);

			if (cachedClient) {
				return {
					client: cachedClient,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			// Create where conditions
			const where: FindOptionsWhere<Client> = {
				uid: ref,
				isDeleted: false,
			};

			// Filter by organization and branch
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			const client = await this.clientsRepository.findOne({
				where,
				relations: ['branch', 'organisation', 'assignedSalesRep', 'quotations', 'checkIns'],
			});

			if (!client) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.cacheManager.set(cacheKey, client, this.CACHE_TTL);

			return {
				client,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				client: null,
			};
		}
	}

	async update(
		ref: number,
		updateClientDto: UpdateClientDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string }> {
		try {
			const existingClient = await this.findOne(ref, orgId, branchId);
			if (!existingClient.client) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Create where conditions including organization and branch
			const whereConditions: FindOptionsWhere<Client> = { uid: ref };

			// Add organization filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			// Update with proper filtering
			await this.clientsRepository.update(whereConditions, updateClientDto as DeepPartial<Client>);

			// Invalidate cache after update
			await this.invalidateClientCache(existingClient.client);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async remove(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			const existingClient = await this.findOne(ref, orgId, branchId);
			if (!existingClient.client) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			// Create where conditions including organization and branch
			const whereConditions: FindOptionsWhere<Client> = { uid: ref };

			// Add organization filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			// Update with proper filtering
			await this.clientsRepository.update(whereConditions, { isDeleted: true });

			// Invalidate cache after deletion
			await this.invalidateClientCache(existingClient.client);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}
	async restore(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Find the deleted client specifically
			const where: FindOptionsWhere<Client> = {
				uid: ref,
				isDeleted: true,
			};

			// Filter by organization and branch
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			const existingClient = await this.clientsRepository.findOne({
				where,
				relations: ['branch', 'organisation'],
			});

			if (!existingClient) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Use the same where conditions for the update
			await this.clientsRepository.update(
				where,
				{
					isDeleted: false,
					status: GeneralStatus.ACTIVE,
				},
			);

			// Invalidate cache after restoration
			await this.invalidateClientCache(existingClient);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async clientsBySearchTerm(
		searchTerm: string,
		page: number = 1,
		limit: number = 10,
		orgId?: number,
		branchId?: number,
	): Promise<PaginatedResponse<Client>> {
		try {
			const cacheKey = `${
				this.CACHE_PREFIX
			}search_${searchTerm?.toLowerCase()}_page${page}_limit${limit}_org${orgId}_branch${branchId}`;
			const cachedResults = await this.cacheManager.get<PaginatedResponse<Client>>(cacheKey);

			if (cachedResults) {
				return cachedResults;
			}

			// Build where conditions for search
			const where: FindOptionsWhere<Client> = { isDeleted: false };

			// Filter by organization and branch
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			// Find clients with search criteria across multiple fields
			const [clients, total] = await this.clientsRepository.findAndCount({
				where: [
					{ ...where, name: ILike(`%${searchTerm?.toLowerCase()}%`) },
					{ ...where, email: ILike(`%${searchTerm?.toLowerCase()}%`) },
					{ ...where, phone: ILike(`%${searchTerm?.toLowerCase()}%`) },
				],
				relations: ['branch', 'organisation'],
				skip: (page - 1) * limit,
				take: limit,
				order: { createdAt: 'DESC' },
			});

			if (!clients) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				data: clients,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};

			await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);

			return response;
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
				message: error?.message,
			};
		}
	}

	// Helper function to calculate distance between two GPS coordinates
	private calculateDistance(
		lat1: number, 
		lon1: number, 
		lat2: number, 
		lon2: number
	): number {
		if (!lat1 || !lon1 || !lat2 || !lon2) {
			return Number.MAX_VALUE; // Return large value if any coordinate is missing
		}

		// Convert to radians
		const R = 6371; // Earth's radius in km
		const dLat = (lat2 - lat1) * (Math.PI / 180);
		const dLon = (lon2 - lon1) * (Math.PI / 180);
		const a = 
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in km
		
		return distance;
	}

	// Parse GPS coordinates string to latitude and longitude numbers
	private parseCoordinates(coordsString: string): { latitude: number; longitude: number } | null {
		if (!coordsString) return null;
		
		try {
			const [latitude, longitude] = coordsString.split(',').map(coord => parseFloat(coord.trim()));
			if (isNaN(latitude) || isNaN(longitude)) return null;
			return { latitude, longitude };
		} catch (error) {
			return null;
		}
	}

	async findNearbyClients(
		latitude: number,
		longitude: number,
		radius: number = 5,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; clients: Array<Client & { distance: number }> }> {
		try {
			if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
				throw new BadRequestException('Invalid coordinates or radius');
			}

			// Build query filters
			const whereConditions: FindOptionsWhere<Client> = {
				isDeleted: false,
			};

			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			// Get all clients with GPS coordinates
			const clients = await this.clientsRepository.find({
				where: whereConditions,
				relations: ['organisation', 'branch'],
			});

			// Filter clients with valid GPS coordinates and calculate distances
			const nearbyClients = clients
				.map(client => {
					const coords = this.parseCoordinates(client.gpsCoordinates);
					if (!coords) return null;

					const distance = this.calculateDistance(
						latitude, 
						longitude, 
						coords.latitude, 
						coords.longitude
					);

					return { ...client, distance };
				})
				.filter(client => client !== null && client.distance <= radius)
				.sort((a, b) => a.distance - b.distance);

			return {
				message: process.env.SUCCESS_MESSAGE || 'Success',
				clients: nearbyClients,
			};
		} catch (error) {
			throw new BadRequestException(error?.message || 'Error finding nearby clients');
		}
	}

	async getClientCheckIns(
		clientId: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; checkIns: CheckIn[] }> {
		try {
			// Find the client first to confirm it exists and belongs to the right org/branch
			const clientResult = await this.findOne(clientId, orgId, branchId);
			if (!clientResult.client) {
				throw new NotFoundException('Client not found');
			}

			// Get check-ins for this client
			const client = await this.clientsRepository.findOne({
				where: { uid: clientId },
				relations: ['checkIns', 'checkIns.owner'],
			});

			if (!client || !client.checkIns) {
				return {
					message: process.env.SUCCESS_MESSAGE || 'Success',
					checkIns: [],
				};
			}

			// Sort check-ins by date, most recent first
			const sortedCheckIns = client.checkIns.sort(
				(a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
			);

			return {
				message: process.env.SUCCESS_MESSAGE || 'Success',
				checkIns: sortedCheckIns,
			};
		} catch (error) {
			throw new BadRequestException(error?.message || 'Error fetching client check-ins');
		}
	}
}
