import { AttendanceStatus } from '../../lib/enums/attendance.enums';
export declare class UpdateAttendanceDto {
    status?: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    duration?: number;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    checkOutNotes?: string;
    owner?: {
        uid: number;
    };
}
