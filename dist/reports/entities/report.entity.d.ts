import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { ReportType, ReportFormat, ReportStatus, ReportTimeframe } from '../../lib/enums/report.enums';
export declare class Report {
    uid: number;
    type: ReportType;
    format: ReportFormat;
    status: ReportStatus;
    timeframe: ReportTimeframe;
    startDate: Date;
    endDate: Date;
    filters: {
        departments?: string[];
        products?: string[];
        status?: string[];
        locations?: string[];
    };
    data: any;
    summary: string;
    errorMessage: string;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
    isDeleted: boolean;
    owner: User;
    ownerUid: number;
    organisation: Organisation;
    organisationRef: string;
    branch: Branch;
    branchUid: number;
    metrics: {
        productivityScore?: number;
        efficiencyScore?: number;
        customerSatisfaction?: number;
        responseTime?: number;
        taskCompletionRate?: number;
        quotationConversionRate?: number;
        claimProcessingTime?: number;
        attendanceRate?: number;
    };
    metadata: {
        generatedBy?: string;
        generationTime?: number;
        dataPoints?: number;
        version?: string;
        source?: string;
    };
}
