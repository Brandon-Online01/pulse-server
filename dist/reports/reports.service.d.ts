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
import { ReportResponse } from './types/report-response.types';
import { GenerateReportDto } from './dto/generate-report.dto';
import { CheckIn } from '../check-ins/entities/check-in.entity';
export declare class ReportsService {
    private readonly reportRepository;
    private checkInRepository;
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
    private readonly logger;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(reportRepository: Repository<Report>, checkInRepository: Repository<CheckIn>, leadService: LeadsService, journalService: JournalService, claimsService: ClaimsService, tasksService: TasksService, shopService: ShopService, attendanceService: AttendanceService, newsService: NewsService, userService: UserService, trackingService: TrackingService, eventEmitter: EventEmitter2, configService: ConfigService, rewardsService: RewardsService);
    private formatCurrency;
    private getDateRange;
    private getPreviousDateRange;
    private calculateGrowth;
    private calculateTrend;
    private handleError;
    private formatReportData;
    managerDailyReport(): Promise<{
        leads: {
            pending: number;
            approved: number;
            inReview: number;
            declined: number;
            total: number;
            metrics: {
                leadTrends: {
                    growth: string;
                };
            };
        };
        claims: {
            pending: number;
            approved: number;
            declined: number;
            paid: number;
            total: number;
            totalValue: string;
            metrics: {
                valueGrowth: string;
            };
        };
        tasks: {
            pending: number;
            completed: number;
            missed: number;
            postponed: number;
            total: number;
            metrics: {
                taskTrends: {
                    growth: string;
                };
            };
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
                grossQuotationValue: string;
                averageQuotationValue: string;
                quotationTrends: {
                    growth: string;
                };
            };
            trends: {
                daily: Record<string, number>;
                weekly: Record<string, number>;
                monthly: Record<string, number>;
            };
        };
        attendance: {
            attendance: number;
            present: number;
            total: number;
            metrics: {
                attendanceTrends: {
                    growth: string;
                };
            };
        };
    }>;
    userDailyReport(reference?: string): Promise<Report | {
        message: any;
        statusCode: any;
    }>;
    private getComparisonData;
    private getPeriodMetrics;
    private getTargetMetrics;
    private getFinancialMetrics;
    private getPerformanceMetrics;
    private getTrendMetrics;
    generateReport(params: GenerateReportDto): Promise<ReportResponse>;
    private getRevenueBreakdown;
    private groupByType;
    private groupBySource;
    private groupByPriority;
    private groupByDepartment;
    private calculateAverageResponseTime;
    private calculateAverageCompletionTime;
    private calculateLeadQualityScore;
    private calculateAverageHours;
    private calculatePunctualityRate;
    private calculateOvertime;
    private calculateAbsences;
    private calculateRemoteWork;
    private calculateDailyPatterns;
    private calculateWeeklyPatterns;
    private calculateMonthlyPatterns;
    private generateHighlights;
    private generateRecommendations;
    private validateMetrics;
    private getTimeFilteredData;
}
