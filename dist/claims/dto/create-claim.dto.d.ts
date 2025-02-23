import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';
export declare class CreateClaimDto {
    comment: string;
    amount: number;
    documentUrl?: string;
    category: ClaimCategory;
    status: ClaimStatus;
    owner: number;
}
