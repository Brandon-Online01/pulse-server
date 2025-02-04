import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
    }>;
    userDailyReport(reference?: string): Promise<import("./entities/report.entity").Report | {
        message: any;
        statusCode: any;
    }>;
    generateReport(generateReportDto: GenerateReportDto): Promise<import("./entities/report.entity").Report | {
        message: any;
        statusCode: any;
    }>;
}
