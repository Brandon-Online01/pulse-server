import { User } from "../../user/entities/user.entity";
import { Branch } from "../../branch/entities/branch.entity";
import { ClaimCategory, ClaimStatus } from "../../lib/enums/finance.enums";
export declare class Claim {
    uid: number;
    amount: string;
    documentUrl: string;
    verifiedBy: number;
    verifiedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    comments: string;
    isDeleted: boolean;
    status: ClaimStatus;
    category: ClaimCategory;
    owner: User;
    branch: Branch;
}
