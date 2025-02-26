import { Organisation } from 'src/organisation/entities/organisation.entity';
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
    breakStartTime: Date;
    breakEndTime: Date;
    createdAt: Date;
    updatedAt: Date;
    verifiedAt: Date;
    owner: User;
    verifiedBy: User;
    organisation: Organisation;
    branch: Branch;
}
