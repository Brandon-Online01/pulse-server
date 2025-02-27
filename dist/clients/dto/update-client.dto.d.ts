import { CreateClientDto } from './create-client.dto';
declare const UpdateClientDto_base: import("@nestjs/common").Type<Partial<CreateClientDto>>;
export declare class UpdateClientDto extends UpdateClientDto_base {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    alternativePhone?: string;
    website?: string;
    logo?: string;
    description?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    isDeleted?: boolean;
    ref?: string;
    assignedSalesRep?: {
        uid: number;
    };
}
export {};
