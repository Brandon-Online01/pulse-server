import { CreateUserDto } from './create-user.dto';
import { Gender } from '../../lib/enums/gender.enums';
import { AccessLevel } from '../../lib/enums/user.enums';
import { Department } from '../../lib/enums/user.enums';
import { AccountStatus } from '../../lib/enums/status.enums';
import { CreateUserProfileDto } from './create-user-profile.dto';
import { CreateUserEmploymentProfileDto } from './create-user-employment-profile.dto';
export declare class UpdateUserProfileDto extends CreateUserProfileDto {
    height?: string;
    weight?: string;
    hairColor?: string;
    eyeColor?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    country?: string;
}
export declare class UpdateUserEmploymentProfileDto extends CreateUserEmploymentProfileDto {
    branchref?: {
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
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    accessLevel?: AccessLevel;
    updatedAt?: Date;
    deletedAt?: Date;
    status?: AccountStatus;
    username?: string;
    password?: string;
    profile?: UpdateUserProfileDto;
    employmentProfile?: UpdateUserEmploymentProfileDto;
}
export {};
