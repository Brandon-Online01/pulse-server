import { ClaimStatus } from "../../lib/enums/status.enums";
export declare class CreateClaimDto {
    amount: number;
    fileUrl: string;
    verifiedBy: {
        uid: number;
    };
    isDeleted: boolean;
    status: ClaimStatus;
    owner: {
        uid: number;
    } | null;
    branch: {
        uid: number;
    };
    comments: string;
    category: string;
}
