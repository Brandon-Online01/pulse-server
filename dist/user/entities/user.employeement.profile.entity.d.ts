import { User } from "./user.entity";
export declare class UserEmployeementProfile {
    uid: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    branchref: string;
    department: string;
    F: any;
    position: string;
    email: string;
    contactNumber: string;
    isCurrentlyEmployed: boolean;
    owner: User;
}
