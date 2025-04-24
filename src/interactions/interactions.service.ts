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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InteractionsService {
	private readonly logger = new Logger(InteractionsService.name);

	constructor(
		@InjectRepository(Interaction)
		private interactionRepository: Repository<Interaction>,
		@InjectRepository(Lead)
		private leadRepository: Repository<Lead>,
		@InjectRepository(Client)
		private clientRepository: Repository<Client>,
		private readonly configService: ConfigService,
	) {}

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

			const response = {
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interaction created successfully',
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
				.orderBy('interaction.createdAt', 'ASC');

			const [interactions, total] = await queryBuilder.getManyAndCount();

			const result = {
				data: interactions,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interactions retrieved successfully',
			};

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
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interaction retrieved successfully',
			};

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

			queryBuilder.orderBy('interaction.createdAt', 'ASC'); // Oldest first for chronological chat view

			const [interactions, total] = await queryBuilder.getManyAndCount();

			const result = {
				data: interactions,
				meta: {
					total,
					page: 1,
					limit: total,
					totalPages: 1,
				},
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interactions retrieved successfully',
			};

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

			queryBuilder.orderBy('interaction.createdAt', 'ASC'); // Oldest first for chronological chat view

			const [interactions, total] = await queryBuilder.getManyAndCount();

			const result = {
				data: interactions,
				meta: {
					total,
					page: 1,
					limit: total,
					totalPages: 1,
				},
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interactions retrieved successfully',
			};

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
				.leftJoinAndSelect('interaction.createdBy', 'createdBy')
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

			return {
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interaction updated successfully',
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
				.leftJoinAndSelect('interaction.createdBy', 'createdBy')
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

			return {
				message: this.configService.get<string>('SUCCESS_MESSAGE') || 'Interaction deleted successfully',
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}
}
