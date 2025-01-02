import { AttendanceStatus } from '../../lib/enums/attendance.enums';
export declare class CreateCheckInDto {
    status?: AttendanceStatus;
    checkIn: Date;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkInNotes?: string;
    branch: {
        uid: number;
    };
    owner: {
        uid: number;
    };
}
