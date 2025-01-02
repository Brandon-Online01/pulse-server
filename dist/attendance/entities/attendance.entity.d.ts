import { Branch } from '../../branch/entities/branch.entity';
import { AttendanceStatus } from '../../lib/enums/attendance.enums';
import { User } from '../../user/entities/user.entity';
export declare class Attendance {
    uid: number;
    status: AttendanceStatus;
    checkIn: Date;
    checkOut: Date;
    duration: string;
    checkInLatitude: number;
    checkInLongitude: number;
    checkOutLatitude: number;
    checkOutLongitude: number;
    checkInNotes: string;
    checkOutNotes: string;
    createdAt: Date;
    updatedAt: Date;
    verifiedBy: string;
    verifiedAt: Date;
    owner: User;
    branch: Branch;
}
