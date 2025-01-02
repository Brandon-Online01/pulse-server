import { CreateResellerDto } from './create-reseller.dto';
import { ResellerStatus } from '../../lib/enums/product.enums';
declare const UpdateResellerDto_base: import("@nestjs/common").Type<Partial<CreateResellerDto>>;
export declare class UpdateResellerDto extends UpdateResellerDto_base {
    name?: string;
    description?: string;
    logo?: string;
    website?: string;
    status?: ResellerStatus;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
}
export {};
