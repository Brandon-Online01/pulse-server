import { CreateOrganisationDto } from './create-organisation.dto';
import { AddressDto } from '../../clients/dto/create-client.dto';
declare const UpdateOrganisationDto_base: import("@nestjs/common").Type<Partial<CreateOrganisationDto>>;
export declare class UpdateOrganisationDto extends UpdateOrganisationDto_base {
    name?: string;
    address: AddressDto;
    email: string;
    phone?: string;
    contactPerson: string;
    website: string;
    logo?: string;
}
export {};
