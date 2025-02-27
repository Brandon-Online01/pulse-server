import { ReportsService } from './reports.service';
import { LiveUserReport } from './report.types';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    userLiveOverview(ref: number): Promise<LiveUserReport>;
}
