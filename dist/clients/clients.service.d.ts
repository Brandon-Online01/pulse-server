import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { GeneralStatus } from '../lib/enums/status.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
export declare class ClientsService {
    private clientsRepository;
    private cacheManager;
    private readonly configService;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    constructor(clientsRepository: Repository<Client>, cacheManager: Cache, configService: ConfigService);
    private getCacheKey;
    private clearClientCache;
    create(createClientDto: CreateClientDto, user?: any): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number, user?: any, filters?: {
        status?: GeneralStatus;
        category?: string;
        search?: string;
    }): Promise<PaginatedResponse<Client>>;
    findOne(ref: number, user?: any): Promise<{
        message: string;
        client: Client | null;
    }>;
    update(ref: number, updateClientDto: UpdateClientDto, user?: any): Promise<{
        message: string;
    }>;
    remove(ref: number, user?: any): Promise<{
        message: string;
    }>;
    restore(ref: number, user?: any): Promise<{
        message: string;
    }>;
}
