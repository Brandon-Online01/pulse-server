import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/client.entity").Client>>;
    findOne(ref: number): Promise<{
        message: string;
        client: import("./entities/client.entity").Client | null;
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
