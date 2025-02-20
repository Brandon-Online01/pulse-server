import { Branch } from '../../branch/entities/branch.entity';
import { ReportType } from '../../lib/enums/reports.enums';
import { User } from '../../user/entities/user.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
export declare class Report {
    uid: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    type: ReportType;
    fileUrl: string;
    metadata: Record<string, any>;
    owner: User;
    status: 'pending' | 'approved' | 'rejected';
    value: number;
    organisation: Organisation;
    branch: Branch;
}
