import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RewardsService } from '../rewards/rewards.service';
export declare class LeadsService {
    private leadRepository;
    private readonly eventEmitter;
    private readonly rewardsService;
    constructor(leadRepository: Repository<Lead>, eventEmitter: EventEmitter2, rewardsService: RewardsService);
    create(createLeadDto: CreateLeadDto): Promise<{
        message: string;
        data: Lead | null;
    }>;
    findAll(): Promise<{
        leads: Lead[] | null;
        message: string;
        stats: any;
    }>;
    findOne(ref: number): Promise<{
        lead: Lead | null;
        message: string;
        stats: any;
    }>;
    leadsByUser(ref: number): Promise<{
        message: string;
        leads: Lead[];
        stats: any;
    }>;
    update(ref: number, updateLeadDto: UpdateLeadDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    private calculateStats;
    getLeadsForDate(date: Date): Promise<{
        message: string;
        leads: {
            pending: Lead[];
            approved: Lead[];
            review: Lead[];
            declined: Lead[];
            total: number;
        };
    }>;
    getLeadsReport(filter: any): Promise<{
        total: number;
        metrics: {
            conversionRate: string;
            averageResponseTime: string;
            topSources: {
                source: string;
                count: number;
            }[];
            qualityScore: number;
            sourceEffectiveness: {
                source: string;
                totalLeads: number;
                convertedLeads: number;
                conversionRate: string;
                averageResponseTime: string;
                qualityScore: number;
            }[];
            geographicDistribution: Record<string, {
                total: number;
                converted: number;
                conversionRate: string;
            }>;
            leadQualityBySource: {
                source: string;
                averageQualityScore: number;
                leadDistribution: {
                    high: number;
                    medium: number;
                    low: number;
                };
            }[];
            conversionTrends: {
                date: string;
                totalLeads: number;
                convertedLeads: number;
                conversionRate: string;
            }[];
            responseTimeDistribution: Record<string, number>;
        };
        review: Lead[];
        pending: Lead[];
        approved: Lead[];
        declined: Lead[];
    }>;
    private calculateAverageResponseTime;
    private analyzeLeadSources;
    private calculateQualityScore;
    private analyzeSourceEffectiveness;
    private analyzeGeographicDistribution;
    private analyzeLeadQualityBySource;
    private analyzeConversionTrends;
    private analyzeResponseTimeDistribution;
    private calculateIndividualLeadQualityScore;
}
