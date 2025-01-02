import { AccessLevel } from "src/lib/enums/user.enums";
import { CreateUserProfileDto } from './create-user-profile.dto';
import { CreateUserEmploymentProfileDto } from './create-user-employment-profile.dto';
import { AccountStatus } from "src/lib/enums/status.enums";
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
