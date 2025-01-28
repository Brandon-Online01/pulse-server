import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';
import { User } from '../../user/entities/user.entity';
export declare class CreateClaimDto {
    title: string;
    description: string;
    amount: number;
    documentUrl?: string;
    category: ClaimCategory;
    status: ClaimStatus;
    owner: User;
}
