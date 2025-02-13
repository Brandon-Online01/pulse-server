import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generateReport(generateReportDto: GenerateReportDto): Promise<import("./types/report-response.types").ReportResponse>;
    managerDailyReport(): Promise<{
        message: any;
        statusCode: any;
    } | {
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
    }>;
    userDailyReport(reference?: string): Promise<import("./entities/report.entity").Report | {
        message: any;
        statusCode: any;
    }>;
}
