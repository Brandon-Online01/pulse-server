import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
export declare class ClientsService {
    private clientsRepository;
    constructor(clientsRepository: Repository<Client>);
    create(createClientDto: CreateClientDto): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number): Promise<PaginatedResponse<Client>>;
    findOne(ref: number): Promise<{
        message: string;
        client: Client | null;
    }>;
    update(ref: number, updateClientDto: UpdateClientDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
}
