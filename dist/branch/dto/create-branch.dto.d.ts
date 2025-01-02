import { GeneralStatus } from '../../lib/enums/status.enums';
export declare class CreateBranchDto {
    name: string;
    email: string;
    phone: string;
    website: string;
    contactPerson: string;
    ref: string;
    address: string;
    status: GeneralStatus;
    organisation: {
        uid: number;
    };
}
