export declare class CreateCheckOutDto {
    checkOut: Date;
    duration?: number;
    checkOutNotes?: string;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    owner: {
        uid: number;
    };
}
