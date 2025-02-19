import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { Claim } from './entities/claim.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClaimCategory, ClaimStatus } from '../lib/enums/finance.enums';
import { ConfigService } from '@nestjs/config';
import { RewardsService } from '../rewards/rewards.service';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
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
    findAll(filters?: {
        status?: ClaimStatus;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
        search?: string;
        assigneeId?: number;
    }, page?: number, limit?: number): Promise<PaginatedResponse<Claim>>;
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
    getClaimsReport(filter: any): Promise<{
        total: number;
        totalValue: number;
        metrics: {
            totalClaims: number;
            averageClaimValue: number;
            approvalRate: string;
            averageProcessingTime: string;
            categoryBreakdown: {
                category: ClaimCategory;
                count: number;
                totalValue: string;
                averageValue: string;
            }[];
            topClaimants: {
                userId: number;
                userName: string;
                totalClaims: number;
                totalValue: string;
                approvalRate: string;
            }[];
            claimValueDistribution: Record<string, number>;
            monthlyTrends: {
                month: string;
                totalClaims: number;
                totalValue: string;
                approvalRate: string;
            }[];
            branchPerformance: {
                branchId: number;
                branchName: string;
                totalClaims: number;
                totalValue: string;
                averageProcessingTime: string;
                approvalRate: string;
            }[];
        };
        paid: Claim[];
        pending: Claim[];
        approved: Claim[];
        declined: Claim[];
    }>;
    private calculateAverageProcessingTime;
    private analyzeCategoryBreakdown;
    private analyzeTopClaimants;
    private analyzeClaimValueDistribution;
    private analyzeMonthlyTrends;
    private analyzeBranchPerformance;
}
