export declare class AddressDto {
    street: string;
    suburb: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}
export declare class CreateClientDto {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    alternativePhone?: string;
    website?: string;
    logo?: string;
    description?: string;
    address: AddressDto;
    category?: string;
    assignedSalesRep: {
        uid: number;
    };
}
