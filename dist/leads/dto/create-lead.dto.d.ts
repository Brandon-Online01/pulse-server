import { GeneralStatus } from "../../lib/enums/status.enums";
export declare class CreateLeadDto {
    name: string;
    email: string;
    phone: string;
    notes: string;
    status: GeneralStatus;
    isDeleted: boolean;
    owner: {
        uid: number;
    };
    branch: {
        uid: number;
    };
}
