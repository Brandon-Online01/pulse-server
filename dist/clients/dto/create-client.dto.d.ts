import { GeneralStatus } from '../../lib/enums/status.enums';
export declare class CreateClientDto {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    alternativePhone?: string;
    website?: string;
    logo?: string;
    description?: string;
    address: string;
    city?: string;
    country?: string;
    postalCode?: string;
    status: GeneralStatus;
    isDeleted: boolean;
    ref: string;
    assignedSalesRep: {
        uid: number;
    };
}
