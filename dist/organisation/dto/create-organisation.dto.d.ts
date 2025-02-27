import { AddressDto } from '../../clients/dto/create-client.dto';
export declare class CreateOrganisationDto {
    name: string;
    address: AddressDto;
    email: string;
    phone: string;
    contactPerson: string;
    website: string;
    logo?: string;
}
