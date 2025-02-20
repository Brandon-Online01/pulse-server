import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';
import { Organisation } from 'src/organisation/entities/organisation.entity';
export declare class Claim {
    uid: number;
    amount: string;
    documentUrl: string;
    verifiedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    comments: string;
    isDeleted: boolean;
    status: ClaimStatus;
    category: ClaimCategory;
    owner: User;
    verifiedBy: User;
    organisation: Organisation;
    branch: Branch;
}
