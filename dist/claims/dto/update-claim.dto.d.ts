import { CreateClaimDto } from './create-claim.dto';
import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';
declare const UpdateClaimDto_base: import("@nestjs/common").Type<Partial<CreateClaimDto>>;
export declare class UpdateClaimDto extends UpdateClaimDto_base {
    status: ClaimStatus;
    comment: string;
    amount: number;
    documentUrl?: string;
    category: ClaimCategory;
    owner: number;
}
export {};
