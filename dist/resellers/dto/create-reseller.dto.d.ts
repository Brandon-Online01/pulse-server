import { AddressDto } from 'src/clients/dto/create-client.dto';
export declare class CreateResellerDto {
    name: string;
    description: string;
    logo: string;
    website: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: AddressDto;
}
