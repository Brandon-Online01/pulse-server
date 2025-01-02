import { AttendanceService } from './attendance.service';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    checkIn(createAttendanceDto: CreateCheckInDto): Promise<{
        message: string;
    }>;
    checkOut(createAttendanceDto: CreateCheckOutDto): Promise<{
        message: string;
        duration?: string;
    }>;
    allCheckIns(): Promise<{
        message: string;
        checkIns: import("./entities/attendance.entity").Attendance[];
    }>;
    checkInsByDate(date: string): Promise<{
        message: string;
        checkIns: import("./entities/attendance.entity").Attendance[];
    }>;
    checkInsByUser(ref: number): Promise<{
        message: string;
        checkIns: import("./entities/attendance.entity").Attendance[];
    }>;
    checkInsByStatus(ref: number): Promise<{
        message: string;
        startTime: string;
        endTime: string;
        nextAction: string;
        isLatestCheckIn: boolean;
        checkedIn: boolean;
    }>;
    checkInsByBranch(ref: string): Promise<{
        message: string;
        checkIns: import("./entities/attendance.entity").Attendance[];
    }>;
}
