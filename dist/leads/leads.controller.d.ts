import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus } from '../lib/enums/lead.enums';
import { PaginatedResponse } from '../lib/interfaces/paginated-response';
import { Lead } from './entities/lead.entity';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(createLeadDto: CreateLeadDto): Promise<{
        message: string;
        data: Lead | null;
    }>;
    findAll(page?: number, limit?: number, status?: LeadStatus, search?: string, startDate?: Date, endDate?: Date): Promise<PaginatedResponse<Lead>>;
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
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
