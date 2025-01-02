import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { UserService } from '../user/user.service';
import { RewardsService } from '../rewards/rewards.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AttendanceService {
    private attendanceRepository;
    private userService;
    private rewardsService;
    private readonly eventEmitter;
    constructor(attendanceRepository: Repository<Attendance>, userService: UserService, rewardsService: RewardsService, eventEmitter: EventEmitter2);
    checkIn(checkInDto: CreateCheckInDto): Promise<{
        message: string;
    }>;
    checkOut(checkOutDto: CreateCheckOutDto): Promise<{
        message: string;
        duration?: string;
    }>;
    allCheckIns(): Promise<{
        message: string;
        checkIns: Attendance[];
    }>;
    checkInsByDate(date: string): Promise<{
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
    checkInsByUser(ref: number): Promise<{
        message: string;
        checkIns: Attendance[];
    }>;
    checkInsByBranch(ref: string): Promise<{
        message: string;
        checkIns: Attendance[];
    }>;
    getAttendancePercentage(): Promise<{
        percentage: number;
        totalHours: number;
    }>;
    getAttendanceForDate(date: Date): Promise<{
        totalHours: number;
    }>;
    getAttendanceForMonth(ref: string): Promise<{
        totalHours: number;
    }>;
    getMonthlyAttendanceStats(): Promise<{
        message: string;
        stats: {
            metrics: {
                totalEmployees: number;
                totalPresent: number;
                attendancePercentage: number;
            };
        };
    }>;
    getCurrentShiftHours(userId: number): Promise<number>;
}
