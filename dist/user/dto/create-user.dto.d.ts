import { AccessLevel } from "../../lib/enums/user.enums";
import { AccountStatus } from "../../lib/enums/status.enums";
import { CreateUserProfileDto } from './create-user-profile.dto';
import { CreateUserEmploymentProfileDto } from './create-user-employment-profile.dto';
export declare class CreateUserDto {
    username: string;
    password: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    photoURL: string;
    accessLevel?: AccessLevel;
    status?: AccountStatus;
    userref: string;
    isDeleted?: boolean;
    profile?: CreateUserProfileDto;
    employmentProfile?: CreateUserEmploymentProfileDto;
}
