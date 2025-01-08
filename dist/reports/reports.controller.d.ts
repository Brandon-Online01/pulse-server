import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
            outForDelivery: number;
            delivered: number;
            rejected: number;
            approved: number;
            metrics: {
                totalOrders: number;
                grossOrderValue: string | number;
                averageOrderValue: string | number;
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
