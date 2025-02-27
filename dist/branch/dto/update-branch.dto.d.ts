import { CreateBranchDto } from './create-branch.dto';
import { GeneralStatus } from '../../lib/enums/status.enums';
import { AddressDto } from '../../clients/dto/create-client.dto';
declare const UpdateBranchDto_base: import("@nestjs/common").Type<Partial<CreateBranchDto>>;
export declare class UpdateBranchDto extends UpdateBranchDto_base {
    name?: string;
    email?: string;
    phone?: string;
    contactPerson?: string;
    address?: AddressDto;
    website?: string;
    status?: GeneralStatus;
    isDeleted?: boolean;
    organisation?: {
        uid: number;
    };
}
export {};
