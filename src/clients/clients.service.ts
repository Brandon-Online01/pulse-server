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

@Injectable()
export class ClientsService {
  private readonly CACHE_TTL: number;
  private readonly CACHE_PREFIX = 'client:';

  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly configService: ConfigService
  ) {
    this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
  }

  private getCacheKey(key: string | number): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  private async clearClientCache(clientId?: number): Promise<void> {
    if (clientId) {
      await this.cacheManager.del(this.getCacheKey(clientId));
    }
    await this.cacheManager.del(this.getCacheKey('all'));
  }

  async create(createClientDto: CreateClientDto, user?: any): Promise<{ message: string }> {
    try {
      // Add organization and branch from user token
      const clientData = {
        ...createClientDto,
        organisation: user?.organisationRef ? { uid: user.organisationRef } : undefined,
        branch: user?.branch?.uid ? { uid: user.branch.uid } : undefined
      } as DeepPartial<Client>;

      const client = await this.clientsRepository.save(clientData);

      if (!client) {
        throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
      }

      // Clear cache after creating new client
      await this.clearClientCache();

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
    }
  ): Promise<PaginatedResponse<Client>> {
    try {
      // Try to get from cache first
      const cacheKey = this.getCacheKey(`all:${page}:${limit}:${JSON.stringify(filters)}`);
      const cached = await this.cacheManager.get<PaginatedResponse<Client>>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Build where conditions
      const where: FindOptionsWhere<Client> = {
        isDeleted: false
      };

      // Security: Always filter by organization and branch
      if (user?.organisationRef) {
        where.organisation = { uid: user?.organisationRef };
      }
      
      if (user?.branch?.uid) {
        where.branch = { uid: user?.branch?.uid };
      }

      // Add filters
      if (filters?.status) {
        where.status = filters?.status;
      }
      if (filters?.category) {
        where.category = filters?.category;
      }
      if (filters?.search) {
        where.name = ILike(`%${filters.search}%`);
      }

      // Execute query with pagination using TypeORM's built-in methods
      const [clients, total] = await this.clientsRepository.findAndCount({
        where,
        relations: ['organisation', 'branch'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      if (!clients) {
        throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
      }

      const result = {
        data: clients,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: process.env.SUCCESS_MESSAGE,
      };

      // Cache the result
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

  async findOne(ref: number, user?: any): Promise<{ message: string, client: Client | null }> {
    try {
      // Try to get from cache first
      const cacheKey = this.getCacheKey(ref);
      const cached = await this.cacheManager.get<Client>(cacheKey);
      
      if (cached) {
        return {
          message: process.env.SUCCESS_MESSAGE,
          client: cached
        };
      }

      // Build where conditions
      const where: FindOptionsWhere<Client> = {
        uid: ref,
        isDeleted: false
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
        relations: ['organisation', 'branch']
      });

      if (!client) {
        throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, client, this.CACHE_TTL);

      return {
        message: process.env.SUCCESS_MESSAGE,
        client
      };
    } catch (error) {
      return {
        message: error?.message,
        client: null
      };
    }
  }

  async update(ref: number, updateClientDto: UpdateClientDto, user?: any): Promise<{ message: string }> {
    try {
      // First check if client exists and belongs to user's org/branch
      const existingClient = await this.findOne(ref, user);
      if (!existingClient.client) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      await this.clientsRepository.update(ref, updateClientDto as DeepPartial<Client>);

      // Clear cache after update
      await this.clearClientCache(ref);

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
      // First check if client exists and belongs to user's org/branch
      const existingClient = await this.findOne(ref, user);
      if (!existingClient.client) {
        throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
      }

      await this.clientsRepository.update(
        { uid: ref },
        { isDeleted: true }
      );

      // Clear cache after deletion
      await this.clearClientCache(ref);

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
      // First check if client exists and belongs to user's org/branch
      const existingClient = await this.findOne(ref, user);
      if (!existingClient.client) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      await this.clientsRepository.update(
        { uid: ref },
        {
          isDeleted: false,
          status: GeneralStatus.ACTIVE
        }
      );

      // Clear cache after restoration
      await this.clearClientCache(ref);

      return {
        message: process.env.SUCCESS_MESSAGE,
      };
    } catch (error) {
      return {
        message: error?.message,
      };
    }
  }
}
