import { Branch } from "src/branch/entities/branch.entity";
import { Client } from "src/clients/entities/client.entity";
import { User } from "src/user/entities/user.entity";
export declare class CheckIn {
    uid: number;
    checkInTime: Date;
    checkInPhoto: string;
    checkInLocation: string;
    checkOutTime: Date;
    checkOutPhoto: string;
    checkOutLocation: string;
    duration: string;
    owner: User;
    branch: Branch;
    client: Client;
}
