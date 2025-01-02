import { CreateBranchDto } from './create-branch.dto';
import { GeneralStatus } from '../../lib/enums/status.enums';
declare const UpdateBranchDto_base: import("@nestjs/common").Type<Partial<CreateBranchDto>>;
export declare class UpdateBranchDto extends UpdateBranchDto_base {
    name?: string;
    email?: string;
    phone?: string;
    contactPerson?: string;
    address?: string;
    website?: string;
    status?: GeneralStatus;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    organisation?: {
        uid: number;
    };
}
export {};
