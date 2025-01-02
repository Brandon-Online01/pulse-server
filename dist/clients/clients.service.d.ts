import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
export declare class ClientsService {
    private clientsRepository;
    constructor(clientsRepository: Repository<Client>);
    create(createClientDto: CreateClientDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        clients: Client[] | null;
    }>;
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
