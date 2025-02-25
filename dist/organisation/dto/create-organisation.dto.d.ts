export declare class CreateOrganisationDto {
    name: string;
    address: {
        streetNumber: string;
        street: string;
        suburb: string;
        city: string;
        province: string;
    };
    email: string;
    phone: string;
    contactPerson: string;
    website: string;
    logo: string;
    ref: string;
}
