import { GeneralStatus } from '../../lib/enums/status.enums';
export declare class CreateBranchDto {
    name: string;
    email: string;
    phone: string;
    website: string;
    contactPerson: string;
    ref: string;
    address: {
        streetNumber: string;
        street: string;
        suburb: string;
        city: string;
        province: string;
        country: string;
        postalCode: string;
    };
    status: GeneralStatus;
    organisation: {
        uid: number;
    };
}
