import { ResellersService } from './resellers.service';
import { CreateResellerDto } from './dto/create-reseller.dto';
import { UpdateResellerDto } from './dto/update-reseller.dto';
export declare class ResellersController {
    private readonly resellersService;
    constructor(resellersService: ResellersService);
    create(createResellerDto: CreateResellerDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        resellers: import("./entities/reseller.entity").Reseller[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        reseller: import("./entities/reseller.entity").Reseller | null;
        message: string;
    }>;
    update(ref: number, updateResellerDto: UpdateResellerDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
