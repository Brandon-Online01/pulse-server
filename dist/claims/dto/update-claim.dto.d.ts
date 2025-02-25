import { CreateClaimDto } from './create-claim.dto';
import { ClaimStatus } from '../../lib/enums/finance.enums';
declare const UpdateClaimDto_base: import("@nestjs/common").Type<Partial<CreateClaimDto>>;
export declare class UpdateClaimDto extends UpdateClaimDto_base {
    status: ClaimStatus;
}
export {};
