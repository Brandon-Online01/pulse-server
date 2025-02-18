import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportResponse } from './types/report-response.types';
export declare class ReportsController {
    private readonly reportsService;
    private readonly logger;
    constructor(reportsService: ReportsService);
    generateReport(generateReportDto: GenerateReportDto): Promise<ReportResponse>;
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
    } | {
        message: any;
        statusCode: any;
    }>;
    userDailyReport(reference?: string): Promise<{
        message: any;
        statusCode: any;
    } | import("./entities/report.entity").Report>;
}
