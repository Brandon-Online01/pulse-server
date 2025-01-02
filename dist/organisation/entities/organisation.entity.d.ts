import { GeneralStatus } from "../../lib/enums/status.enums";
import { Branch } from "../../branch/entities/branch.entity";
export declare class Organisation {
    uid: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    logo: string;
    createdAt: Date;
    updatedAt: Date;
    status: GeneralStatus;
    isDeleted: boolean;
    ref: string;
    branches: Branch[];
}
