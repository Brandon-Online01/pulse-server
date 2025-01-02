import { Gender } from "../../lib/enums/gender.enums";
export declare class CreateUserProfileDto {
    owner: {
        uid: number;
    };
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
