import { Injectable, NotFoundException, Inject } from '@nestjs/common';
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

	async create(createClientDto: CreateClientDto, user?: any): Promise<{ message: string }> {
		try {
			// Add organization and branch from user token
			const clientData = {
				...createClientDto,
				organisation: user?.organisationRef ? { uid: user.organisationRef } : undefined,
				branch: user?.branch?.uid ? { uid: user.branch.uid } : undefined,
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
		user?: any,
		filters?: {
			status?: GeneralStatus;
			category?: string;
			search?: string;
		},
	): Promise<PaginatedResponse<Client>> {
		try {
			const cacheKey = `${this.CACHE_PREFIX}page${page}_limit${limit}_${JSON.stringify(filters)}`;
			const cachedClients = await this.cacheManager.get<PaginatedResponse<Client>>(cacheKey);

			if (cachedClients) {
				return cachedClients;
			}

			// Create find options with relationships
			const where: FindOptionsWhere<Client> = { isDeleted: false };

			// Security: Always filter by organization and branch
			if (user?.organisationRef) {
				where.organisation = { uid: user.organisationRef };
			}

			if (user?.branch?.uid) {
				where.branch = { uid: user.branch.uid };
			}

			if (filters?.status) {
				where.status = filters.status;
			}

			if (filters?.category) {
				where.category = filters.category;
			}

			if (filters?.search) {
				// Handle search across multiple fields
				return this.clientsBySearchTerm(filters.search, page, limit, user);
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

	async findOne(ref: number, user?: any): Promise<{ message: string; client: Client | null }> {
		try {
			const cacheKey = this.getCacheKey(ref);
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

			// Security: Always filter by organization and branch
			if (user?.organisationRef) {
				where.organisation = { uid: user.organisationRef };
			}

			if (user?.branch?.uid) {
				where.branch = { uid: user.branch.uid };
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

	async update(ref: number, updateClientDto: UpdateClientDto, user?: any): Promise<{ message: string }> {
		try {
			const existingClient = await this.findOne(ref, user);
			if (!existingClient.client) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.clientsRepository.update(ref, updateClientDto as DeepPartial<Client>);

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

	async remove(ref: number, user?: any): Promise<{ message: string }> {
		try {
			const existingClient = await this.findOne(ref, user);
			if (!existingClient.client) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			await this.clientsRepository.update({ uid: ref }, { isDeleted: true });

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
	async restore(ref: number, user?: any): Promise<{ message: string }> {
		try {
			// Find the deleted client specifically
			const existingClient = await this.clientsRepository.findOne({
				where: {
					uid: ref,
					isDeleted: true,
					...(user?.organisationRef && { organisation: { uid: user.organisationRef } }),
					...(user?.branch?.uid && { branch: { uid: user.branch.uid } }),
				},
				relations: ['branch', 'organisation'],
			});

			if (!existingClient) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.clientsRepository.update(
				{ uid: ref },
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
		user?: any,
	): Promise<PaginatedResponse<Client>> {
		try {
			const cacheKey = `${this.CACHE_PREFIX}search_${searchTerm?.toLowerCase()}_page${page}_limit${limit}`;
			const cachedResults = await this.cacheManager.get<PaginatedResponse<Client>>(cacheKey);

			if (cachedResults) {
				return cachedResults;
			}

			// Build where conditions for search
			const where: FindOptionsWhere<Client> = { isDeleted: false };

			// Security: Always filter by organization and branch
			if (user?.organisationRef) {
				where.organisation = { uid: user.organisationRef };
			}

			if (user?.branch?.uid) {
				where.branch = { uid: user.branch.uid };
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
}
