import { Branch } from '../../branch/entities/branch.entity';
import { ReportType } from '../../lib/enums/reports.enums';
import { User } from 'src/user/entities/user.entity';
export declare class Report {
    uid: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    type: ReportType;
    fileUrl: string;
    metadata: Record<string, any>;
    branch: Branch;
    owner: User;
}
