import { LeadStatus } from "src/lib/enums/lead.enums";
export declare class CreateLeadDto {
    name: string;
    email: string;
    phone: string;
    notes: string;
    status: LeadStatus;
    isDeleted: boolean;
    owner: {
        uid: number;
    };
    branch: {
        uid: number;
    };
}
