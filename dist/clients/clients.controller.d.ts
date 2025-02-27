import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
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
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
