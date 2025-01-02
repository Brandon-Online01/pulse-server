import { GeneralStatus } from "../../lib/enums/status.enums";
export declare class CreateOrganisationDto {
    name: string;
    address: string;
    email: string;
    phone: string;
    contactPerson: string;
    website: string;
    logo: string;
    status: GeneralStatus;
    isDeleted: boolean;
    ref: string;
}
