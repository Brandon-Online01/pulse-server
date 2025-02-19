import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus } from '../lib/enums/lead.enums';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(createLeadDto: CreateLeadDto): Promise<{
        message: string;
        data: import("./entities/lead.entity").Lead | null;
    }>;
    findAll(page?: number, limit?: number, status?: LeadStatus, search?: string, startDate?: Date, endDate?: Date): Promise<import("../lib/types/paginated-response").PaginatedResponse<import("./entities/lead.entity").Lead>>;
    findOne(ref: number): Promise<{
        lead: import("./entities/lead.entity").Lead | null;
        message: string;
        stats: any;
    }>;
    leadsByUser(ref: number): Promise<{
        message: string;
        leads: import("./entities/lead.entity").Lead[];
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
