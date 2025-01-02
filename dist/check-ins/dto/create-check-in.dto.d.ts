export declare class CreateCheckInDto {
    checkInTime: string;
    checkInPhoto: string;
    checkInLocation: string;
    owner: {
        uid: number;
    };
    branch: {
        uid: number;
    };
}
