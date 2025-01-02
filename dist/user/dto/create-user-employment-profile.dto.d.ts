import { Department } from "src/lib/enums/user.enums";
export declare class CreateUserEmploymentProfileDto {
    branchref?: {
        uid: number;
    };
    owner?: {
        uid: number;
    };
    position?: string;
    department?: Department;
    startDate?: Date;
    endDate?: Date;
    isCurrentlyEmployed?: boolean;
    email?: string;
    contactNumber?: string;
}
