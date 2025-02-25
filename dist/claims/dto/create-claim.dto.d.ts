import { ClaimCategory } from '../../lib/enums/finance.enums';
export declare class CreateClaimDto {
    comment: string;
    amount: number;
    documentUrl?: string;
    category: ClaimCategory;
    owner: number;
}
