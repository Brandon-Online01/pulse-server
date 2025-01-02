import { CreateResellerDto } from './dto/create-reseller.dto';
import { UpdateResellerDto } from './dto/update-reseller.dto';
import { Repository } from 'typeorm';
import { Reseller } from './entities/reseller.entity';
export declare class ResellersService {
    private resellerRepository;
    constructor(resellerRepository: Repository<Reseller>);
    create(createResellerDto: CreateResellerDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        resellers: Reseller[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        reseller: Reseller | null;
        message: string;
    }>;
    update(ref: number, updateResellerDto: UpdateResellerDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
}
