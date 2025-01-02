import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { Claim } from './entities/claim.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClaimCategory } from '../lib/enums/finance.enums';
import { ConfigService } from '@nestjs/config';
import { RewardsService } from '../rewards/rewards.service';
export declare class ClaimsService {
    private claimsRepository;
    private rewardsService;
    private eventEmitter;
    private readonly configService;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(claimsRepository: Repository<Claim>, rewardsService: RewardsService, eventEmitter: EventEmitter2, configService: ConfigService);
    private formatCurrency;
    private calculateStats;
    create(createClaimDto: CreateClaimDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        claims: Claim[] | null;
        stats: any;
    }>;
    findOne(ref: number): Promise<{
        message: string;
        claim: Claim | null;
        stats: any;
    }>;
    claimsByUser(ref: number): Promise<{
        message: string;
        claims: Claim[];
        stats: {
            total: number;
            pending: number;
            approved: number;
            declined: number;
            paid: number;
        };
    }>;
    getClaimsForDate(date: Date): Promise<{
        message: string;
        claims: {
            pending: Claim[];
            approved: Claim[];
            declined: Claim[];
            paid: Claim[];
            totalValue: string;
        };
    }>;
    update(ref: number, updateClaimDto: UpdateClaimDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    getTotalClaimsStats(): Promise<{
        totalClaims: number;
        totalValue: string;
        byCategory: Record<ClaimCategory, number>;
    }>;
}
