import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './entities/interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Lead } from '../leads/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';
import { PaginatedResponse } from 'src/lib/types/paginated-response';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { User } from 'src/user/entities/user.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InteractionsService {
	private readonly CACHE_PREFIX = 'interactions:';
	private readonly CACHE_TTL: number;
	private readonly logger = new Logger(InteractionsService.name);

	constructor(
		@InjectRepository(Interaction)
		private interactionRepository: Repository<Interaction>,
		@InjectRepository(Lead)
		private leadRepository: Repository<Lead>,
		@InjectRepository(Client)
		private clientRepository: Repository<Client>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly eventEmitter: EventEmitter2,
	) {
		this.CACHE_TTL = Number(process.env.CACHE_EXPIRATION_TIME) || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async invalidateInteractionCache(interaction: Interaction) {
		try {
			// Get all cache keys
			const keys = await this.cacheManager.store.keys();

			// Keys to clear
			const keysToDelete = [];

			// Add interaction-specific keys
			keysToDelete.push(this.getCacheKey(interaction.uid), `${this.CACHE_PREFIX}all`);

			// Add lead-specific keys if applicable
			if (interaction.lead?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}lead_${interaction.lead.uid}`);
			}

			// Add client-specific keys if applicable
			if (interaction.client?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}client_${interaction.client.uid}`);
			}

			// Add organization-specific keys
			if (interaction.organisation?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}org_${interaction.organisation.uid}`);
			}

			// Add branch-specific keys
			if (interaction.branch?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}branch_${interaction.branch.uid}`);
			}

			// Clear all pagination and search caches
			const interactionListCaches = keys.filter(
				(key) =>
					key.startsWith(`${this.CACHE_PREFIX}page`) ||
					key.startsWith(`${this.CACHE_PREFIX}search`) ||
					key.includes('_limit'),
			);
			keysToDelete.push(...interactionListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));

			// Emit event for other services that might be caching interaction data
			this.eventEmitter.emit('interactions.cache.invalidate', {
				interactionId: interaction.uid,
				keys: keysToDelete,
			});
		} catch (error) {
			this.logger.error('Error invalidating interaction cache:', error);
		}
	}

	async create(
		createInteractionDto: CreateInteractionDto,
		orgId?: number,
		branchId?: number,
		user?: number,
	): Promise<{ message: string; data: Interaction | null }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Check if at least one of leadUid or clientUid is provided
			if (!createInteractionDto.leadUid && !createInteractionDto.clientUid) {
				throw new BadRequestException('Either leadUid or clientUid must be provided');
			}

			// Create the interaction entity
			const interaction = new Interaction();
			interaction.message = createInteractionDto.message;
			interaction.attachmentUrl = createInteractionDto.attachmentUrl;
			interaction.type = createInteractionDto.type;
			interaction.createdBy = createInteractionDto.createdBy;

			// Set organization
			if (orgId) {
				const organisation = { uid: orgId } as Organisation;
				interaction.organisation = organisation;
			}

			// Set branch if provided
			if (branchId) {
				const branch = { uid: branchId } as Branch;
				interaction.branch = branch;
			}

			// Set createdBy if provided
			if (user) {
				const createdBy = { uid: user } as User;
				interaction.createdBy = createdBy;
			}

			// Set lead if provided
			if (createInteractionDto.leadUid) {
				const lead = await this.leadRepository.findOne({
					where: { uid: createInteractionDto.leadUid, isDeleted: false },
				});
				if (!lead) {
					throw new NotFoundException(`Lead with ID ${createInteractionDto.leadUid} not found`);
				}
				interaction.lead = lead;
			}

			// Set client if provided
			if (createInteractionDto.clientUid) {
				const client = await this.clientRepository.findOne({
					where: { uid: createInteractionDto.clientUid, isDeleted: false },
				});
				if (!client) {
					throw new NotFoundException(`Client with ID ${createInteractionDto.clientUid} not found`);
				}
				interaction.client = client;
			}

			const savedInteraction = await this.interactionRepository.save(interaction);

			// Invalidate relevant caches
			await this.invalidateInteractionCache(savedInteraction);

			const response = {
				message: process.env.SUCCESS_MESSAGE || 'Interaction created successfully',
				data: savedInteraction,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				data: null,
			};

			return response;
		}
	}

	async findAll(
		filters?: {
			search?: string;
			startDate?: Date;
			endDate?: Date;
			leadUid?: number;
			clientUid?: number;
		},
		page: number = 1,
		limit: number = 25,
		orgId?: number,
		branchId?: number,
	): Promise<PaginatedResponse<Interaction>> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Generate cache key based on parameters
			const cacheKey = this.getCacheKey(
				`page_${page}_limit_${limit}_org_${orgId}_branch_${branchId || 'all'}_` +
					`lead_${filters?.leadUid || 'all'}_client_${filters?.clientUid || 'all'}_` +
					`search_${filters?.search || 'none'}_date_${filters?.startDate?.toISOString() || 'all'}_${
						filters?.endDate?.toISOString() || 'all'
					}`,
			);

			// Try to get from cache first
			const cachedResult = await this.cacheManager.get(cacheKey);
			if (cachedResult) {
				return cachedResult as PaginatedResponse<Interaction>;
			}

			const queryBuilder = this.interactionRepository
				.createQueryBuilder('interaction')
				.leftJoinAndSelect('interaction.createdBy', 'createdBy')
				.leftJoinAndSelect('interaction.lead', 'lead')
				.leftJoinAndSelect('interaction.client', 'client')
				.leftJoinAndSelect('interaction.branch', 'branch')
				.leftJoinAndSelect('interaction.organisation', 'organisation')
				.where('interaction.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('organisation.uid = :orgId', { orgId });

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			// Apply lead filter if provided
			if (filters?.leadUid) {
				queryBuilder.andWhere('lead.uid = :leadUid', { leadUid: filters.leadUid });
			}

			// Apply client filter if provided
			if (filters?.clientUid) {
				queryBuilder.andWhere('client.uid = :clientUid', { clientUid: filters.clientUid });
			}

			if (filters?.startDate && filters?.endDate) {
				queryBuilder.andWhere('interaction.createdAt BETWEEN :startDate AND :endDate', {
					startDate: filters.startDate,
					endDate: filters.endDate,
				});
			}

			if (filters?.search) {
				queryBuilder.andWhere(
					'(interaction.message ILIKE :search OR createdBy.name ILIKE :search OR createdBy.surname ILIKE :search)',
					{ search: `%${filters.search}%` },
				);
			}

			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('interaction.createdAt', 'ASC'); // Newest first, oldest last

			const [interactions, total] = await queryBuilder.getManyAndCount();

			const result = {
				data: interactions,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE || 'Interactions retrieved successfully',
			};

			// Store in cache
			await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

			return result;
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

	async findOne(
		uid: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ interaction: Interaction | null; message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Generate cache key
			const cacheKey = this.getCacheKey(`uid_${uid}_org_${orgId}_branch_${branchId || 'all'}`);

			// Try to get from cache first
			const cachedResult = await this.cacheManager.get(cacheKey);
			if (cachedResult) {
				return cachedResult as { interaction: Interaction; message: string };
			}

			const queryBuilder = this.interactionRepository
				.createQueryBuilder('interaction')
				.leftJoinAndSelect('interaction.createdBy', 'createdBy')
				.leftJoinAndSelect('interaction.lead', 'lead')
				.leftJoinAndSelect('interaction.client', 'client')
				.leftJoinAndSelect('interaction.branch', 'branch')
				.leftJoinAndSelect('interaction.organisation', 'organisation')
				.where('interaction.uid = :uid', { uid })
				.andWhere('interaction.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('organisation.uid = :orgId', { orgId });

			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const interaction = await queryBuilder.getOne();

			if (!interaction) {
				throw new NotFoundException(`Interaction with ID ${uid} not found`);
			}

			const result = {
				interaction,
				message: process.env.SUCCESS_MESSAGE || 'Interaction retrieved successfully',
			};

			// Store in cache
			await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

			return result;
		} catch (error) {
			return {
				interaction: null,
				message: error?.message,
			};
		}
	}

	async findByLead(leadUid: number, orgId?: number, branchId?: number): Promise<PaginatedResponse<Interaction>> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Generate cache key
			const cacheKey = this.getCacheKey(`lead_${leadUid}_org_${orgId}_branch_${branchId || 'all'}`);

			// Try to get from cache first
			const cachedResult = await this.cacheManager.get(cacheKey);
			if (cachedResult) {
				return cachedResult as PaginatedResponse<Interaction>;
			}

			const queryBuilder = this.interactionRepository
				.createQueryBuilder('interaction')
				.leftJoinAndSelect('interaction.createdBy', 'createdBy')
				.leftJoinAndSelect('interaction.lead', 'lead')
				.leftJoinAndSelect('interaction.client', 'client')
				.where('interaction.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('lead.uid = :leadUid', { leadUid })
				.andWhere('interaction.organisation.uid = :orgId', { orgId });

			if (branchId) {
				queryBuilder.andWhere('interaction.branch.uid = :branchId', { branchId });
			}

			queryBuilder.orderBy('interaction.createdAt', 'ASC'); // Newest first, oldest last

			const [interactions, total] = await queryBuilder.getManyAndCount();

			const result = {
				data: interactions,
				meta: {
					total,
					page: 1,
					limit: total,
					totalPages: 1,
				},
				message: process.env.SUCCESS_MESSAGE || 'Interactions retrieved successfully',
			};

			// Store in cache
			await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

			return result;
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page: 1,
					limit: 0,
					totalPages: 0,
				},
				message: error?.message,
			};
		}
	}

	async findByClient(clientUid: number, orgId?: number, branchId?: number): Promise<PaginatedResponse<Interaction>> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Generate cache key
			const cacheKey = this.getCacheKey(`client_${clientUid}_org_${orgId}_branch_${branchId || 'all'}`);

			// Try to get from cache first
			const cachedResult = await this.cacheManager.get(cacheKey);
			if (cachedResult) {
				return cachedResult as PaginatedResponse<Interaction>;
			}

			const queryBuilder = this.interactionRepository
				.createQueryBuilder('interaction')
				.leftJoinAndSelect('interaction.createdBy', 'createdBy')
				.leftJoinAndSelect('interaction.lead', 'lead')
				.leftJoinAndSelect('interaction.client', 'client')
				.where('interaction.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('client.uid = :clientUid', { clientUid })
				.andWhere('interaction.organisation.uid = :orgId', { orgId });

			if (branchId) {
				queryBuilder.andWhere('interaction.branch.uid = :branchId', { branchId });
			}

			queryBuilder.orderBy('interaction.createdAt', 'ASC'); // Newest first, oldest last

			const [interactions, total] = await queryBuilder.getManyAndCount();

			const result = {
				data: interactions,
				meta: {
					total,
					page: 1,
					limit: total,
					totalPages: 1,
				},
				message: process.env.SUCCESS_MESSAGE || 'Interactions retrieved successfully',
			};

			// Store in cache
			await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

			return result;
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page: 1,
					limit: 0,
					totalPages: 0,
				},
				message: error?.message,
			};
		}
	}

	async update(
		uid: number,
		updateInteractionDto: UpdateInteractionDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const queryBuilder = this.interactionRepository
				.createQueryBuilder('interaction')
				.leftJoinAndSelect('interaction.organisation', 'organisation')
				.leftJoinAndSelect('interaction.branch', 'branch')
				.leftJoinAndSelect('interaction.lead', 'lead')
				.leftJoinAndSelect('interaction.client', 'client')
				.where('interaction.uid = :uid', { uid })
				.andWhere('interaction.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('organisation.uid = :orgId', { orgId });

			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const interaction = await queryBuilder.getOne();

			if (!interaction) {
				throw new NotFoundException(`Interaction with ID ${uid} not found`);
			}

			// Update the interaction
			const updatedInteraction = { ...interaction, ...updateInteractionDto };
			await this.interactionRepository.save(updatedInteraction);

			// Invalidate cache
			await this.invalidateInteractionCache(updatedInteraction);

			return {
				message: process.env.SUCCESS_MESSAGE || 'Interaction updated successfully',
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async remove(uid: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const queryBuilder = this.interactionRepository
				.createQueryBuilder('interaction')
				.leftJoinAndSelect('interaction.organisation', 'organisation')
				.leftJoinAndSelect('interaction.branch', 'branch')
				.leftJoinAndSelect('interaction.lead', 'lead')
				.leftJoinAndSelect('interaction.client', 'client')
				.where('interaction.uid = :uid', { uid })
				.andWhere('interaction.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('organisation.uid = :orgId', { orgId });

			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const interaction = await queryBuilder.getOne();

			if (!interaction) {
				throw new NotFoundException(`Interaction with ID ${uid} not found`);
			}

			// Soft delete by updating isDeleted flag
			interaction.isDeleted = true;
			await this.interactionRepository.save(interaction);

			// Invalidate cache
			await this.invalidateInteractionCache(interaction);

			return {
				message: process.env.SUCCESS_MESSAGE || 'Interaction deleted successfully',
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}
}
