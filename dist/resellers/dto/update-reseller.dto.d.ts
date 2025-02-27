import { CreateResellerDto } from './create-reseller.dto';
import { AddressDto } from 'src/clients/dto/create-client.dto';
declare const UpdateResellerDto_base: import("@nestjs/common").Type<Partial<CreateResellerDto>>;
export declare class UpdateResellerDto extends UpdateResellerDto_base {
    name?: string;
    description?: string;
    logo?: string;
    website?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: AddressDto;
}
export {};
