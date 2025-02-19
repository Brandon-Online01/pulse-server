import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
export declare class ClaimsController {
    private readonly claimsService;
    constructor(claimsService: ClaimsService);
    create(createClaimDto: CreateClaimDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/claim.entity").Claim>>;
    findOne(ref: number): Promise<{
        message: string;
        claim: import("./entities/claim.entity").Claim | null;
        stats: any;
    }>;
    update(ref: number, updateClaimDto: UpdateClaimDto): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    claimsByUser(ref: number): Promise<{
        message: string;
        claims: import("./entities/claim.entity").Claim[];
        stats: {
            total: number;
            pending: number;
            approved: number;
            declined: number;
            paid: number;
        };
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
