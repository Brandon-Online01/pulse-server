import { AddressDto } from "../../clients/dto/create-client.dto";
export declare class CreateBranchDto {
    name: string;
    email: string;
    phone: string;
    website: string;
    contactPerson: string;
    ref: string;
    address: AddressDto;
    organisation: {
        uid: number;
    };
}
