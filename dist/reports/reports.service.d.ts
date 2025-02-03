import { LeadsService } from '../leads/leads.service';
import { JournalService } from '../journal/journal.service';
import { ClaimsService } from '../claims/claims.service';
import { TasksService } from '../tasks/tasks.service';
import { AttendanceService } from '../attendance/attendance.service';
import { ShopService } from '../shop/shop.service';
import { NewsService } from '../news/news.service';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { RewardsService } from 'src/rewards/rewards.service';
import { TrackingService } from '../tracking/tracking.service';
export declare class ReportsService {
    private readonly reportRepository;
    private readonly leadService;
    private readonly journalService;
    private readonly claimsService;
    private readonly tasksService;
    private readonly shopService;
    private readonly attendanceService;
    private readonly newsService;
    private readonly userService;
    private readonly trackingService;
    private readonly eventEmitter;
    private readonly configService;
    private readonly rewardsService;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(reportRepository: Repository<Report>, leadService: LeadsService, journalService: JournalService, claimsService: ClaimsService, tasksService: TasksService, shopService: ShopService, attendanceService: AttendanceService, newsService: NewsService, userService: UserService, trackingService: TrackingService, eventEmitter: EventEmitter2, configService: ConfigService, rewardsService: RewardsService);
    private formatCurrency;
    private calculateGrowth;
    private handleError;
    private formatReportData;
    managerDailyReport(): Promise<{
        leads: {
            pending: number;
            approved: number;
            inReview: number;
            declined: number;
            total: number;
        };
        journals: {
            total: number;
        };
        claims: {
            pending: number;
            approved: number;
            declined: number;
            paid: number;
            totalValue: string | number;
        };
        tasks: {
            pending: number;
            completed: number;
            missed: number;
            postponed: number;
            total: number;
        };
        attendance: {
            attendance: number;
            present: number;
            total: number;
        };
        orders: {
            pending: number;
            processing: number;
            completed: number;
            cancelled: number;
            postponed: number;
            rejected: number;
            approved: number;
            metrics: {
                totalQuotations: number;
                grossQuotationValue: string | number;
                averageQuotationValue: string | number;
            };
        };
    } | {
        message: any;
        statusCode: any;
    }>;
    userDailyReport(reference?: string): Promise<{
        message: any;
        statusCode: any;
    } | Report>;
}
