import { CreateBranchDto } from './create-branch.dto';
import { GeneralStatus } from '../../lib/enums/status.enums';
declare const UpdateBranchDto_base: import("@nestjs/common").Type<Partial<CreateBranchDto>>;
export declare class UpdateBranchDto extends UpdateBranchDto_base {
    name?: string;
    email?: string;
    phone?: string;
    contactPerson?: string;
    address?: {
        streetNumber: string;
        street: string;
        suburb: string;
        city: string;
        province: string;
        country: string;
        postalCode: string;
    };
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
