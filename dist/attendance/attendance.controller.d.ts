import { AttendanceService } from './attendance.service';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { CreateBreakDto } from './dto/create-attendance-break.dto';
import { Attendance } from './entities/attendance.entity';
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
    manageBreak(breakDto: CreateBreakDto): Promise<{
        message: string;
    }>;
    allCheckIns(): Promise<{
        message: string;
        checkIns: Attendance[];
    }>;
    checkInsByDate(date: string): Promise<{
        message: string;
        checkIns: Attendance[];
    }>;
    checkInsByUser(ref: number): Promise<{
        message: string;
        checkIns: Attendance[];
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
        checkIns: Attendance[];
    }>;
    getDailyStats(uid: number, date: string): Promise<{
        message: string;
        dailyWorkTime: number;
        dailyBreakTime: number;
    }>;
}
