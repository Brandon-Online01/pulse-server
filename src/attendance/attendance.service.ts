import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, MoreThanOrEqual, Not, Repository, LessThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus } from '../lib/enums/attendance.enums';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { isToday } from 'date-fns';
import { differenceInMinutes, differenceInHours, startOfMonth, endOfMonth } from 'date-fns';
import { UserService } from 'src/user/user.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { XP_VALUES_TYPES } from 'src/lib/constants/constants';
import { XP_VALUES } from 'src/lib/constants/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private userService: UserService,
    private rewardsService: RewardsService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  public async checkIn(checkInDto: CreateCheckInDto): Promise<{ message: string }> {
    try {
      const checkIn = await this.attendanceRepository.save(checkInDto);

      if (!checkIn) {
        throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      await this.rewardsService.awardXP({
        owner: checkInDto.owner.uid,
        amount: XP_VALUES.CHECK_IN,
        action: XP_VALUES_TYPES.ATTENDANCE,
        source: {
          id: checkInDto.owner.uid.toString(),
          type: XP_VALUES_TYPES.ATTENDANCE,
          details: 'Check-in reward'
        }
      });

      return response;
    } catch (error) {

      const response = {
        message: error?.message,
      }

      return response;
    }
  }

  public async checkOut(checkOutDto: CreateCheckOutDto): Promise<{ message: string, duration?: string }> {
    try {
      const activeShift = await this.attendanceRepository.findOne({
        where: {
          status: AttendanceStatus.PRESENT,
          owner: checkOutDto?.owner,
          checkIn: Not(IsNull()),
          checkOut: IsNull(),
        },
        order: {
          checkIn: 'DESC'
        }
      });

      if (activeShift) {
        const checkOutTime = new Date();
        const checkInTime = new Date(activeShift.checkIn);

        const minutesWorked = differenceInMinutes(checkOutTime, checkInTime);
        const hoursWorked = differenceInHours(checkOutTime, checkInTime);
        const remainingMinutes = minutesWorked % 60;

        const duration = `${hoursWorked}h ${remainingMinutes}m`;

        const updatedShift = {
          ...activeShift,
          ...checkOutDto,
          checkOut: checkOutTime,
          duration,
          status: AttendanceStatus.COMPLETED
        }

        await this.attendanceRepository.save(updatedShift);

        const response = {
          message: process.env.SUCCESS_MESSAGE,
          duration
        }

        await this.rewardsService.awardXP({
          owner: checkOutDto.owner.uid,
          amount: XP_VALUES.CHECK_OUT,
          action: XP_VALUES_TYPES.ATTENDANCE,
          source: {
            id: checkOutDto.owner.uid.toString(),
            type: XP_VALUES_TYPES.ATTENDANCE,
            details: 'Check-out reward'
          }
        });

        this.eventEmitter.emit('daily-report', checkOutDto?.owner?.uid?.toString());

        return response;
      }
    } catch (error) {
      const response = {
        message: error?.message,
        duration: null
      }

      return response;
    }
  }

  public async allCheckIns(): Promise<{ message: string, checkIns: Attendance[] }> {
    try {
      const checkIns = await this.attendanceRepository.find();

      if (!checkIns) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        checkIns
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get all check ins - ${error.message}`,
        checkIns: null
      }

      return response;
    }
  }

  public async checkInsByDate(date: string): Promise<{ message: string, checkIns: Attendance[] }> {
    try {
      const checkIns = await this.attendanceRepository.find({
        where: {
          checkIn: MoreThanOrEqual(new Date(date))
        }
      });

      if (!checkIns) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        checkIns
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get check ins by date - ${error.message}`,
        checkIns: null
      }

      return response;
    }
  }

  public async checkInsByStatus(ref: number): Promise<{ message: string, startTime: string, endTime: string, nextAction: string, isLatestCheckIn: boolean, checkedIn: boolean }> {
    try {
      const [checkIn] = await this.attendanceRepository.find({
        where: {
          owner: {
            uid: ref
          }
        },
        order: {
          checkIn: 'DESC'
        }
      });

      if (!checkIn) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const isLatestCheckIn = isToday(new Date(checkIn?.checkIn));

      const {
        status,
        checkOut,
        createdAt,
        updatedAt,
        verifiedAt,
        checkIn: CheckInTime,
        ...restOfCheckIn
      } = checkIn;

      const nextAction = status === AttendanceStatus.PRESENT ? 'End Shift' : 'Start Shift';
      const checkedIn = status === AttendanceStatus.PRESENT ? true : false;

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        startTime: `${CheckInTime}`,
        endTime: `${checkOut}`,
        createdAt: `${createdAt}`,
        updatedAt: `${updatedAt}`,
        verifiedAt: `${verifiedAt}`,
        nextAction,
        isLatestCheckIn,
        checkedIn,
        ...restOfCheckIn
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get check in - ${error?.message}`,
        startTime: null,
        endTime: null,
        nextAction: null,
        isLatestCheckIn: false,
        checkedIn: false
      }

      return response;
    }
  }

  public async checkInsByUser(ref: number): Promise<{ message: string, checkIns: Attendance[] }> {
    try {
      const checkIns = await this.attendanceRepository.find({
        where: { owner: { uid: ref } }
      });

      if (!checkIns) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        checkIns
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get check ins by user - ${error?.message}`,
        checkIns: null
      }

      return response;
    }
  }

  public async checkInsByBranch(ref: string): Promise<{ message: string, checkIns: Attendance[] }> {
    try {
      const checkIns = await this.attendanceRepository.find({
        where: {
          branch: { ref }
        }
      });

      if (!checkIns) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        checkIns
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get check ins by branch - ${error?.message}`,
        checkIns: null
      }

      return response;
    }
  }

  public async getAttendancePercentage(): Promise<{ percentage: number, totalHours: number }> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));

      const attendanceRecords = await this.attendanceRepository.find({
        where: {
          checkIn: MoreThanOrEqual(startOfDay),
          status: AttendanceStatus.COMPLETED
        }
      });

      let totalMinutesWorked = 0;

      // Calculate total minutes worked
      attendanceRecords.forEach(record => {
        if (record.checkIn && record.checkOut) {
          const minutes = differenceInMinutes(
            new Date(record.checkOut),
            new Date(record.checkIn)
          );
          totalMinutesWorked += minutes;
        }
      });

      // Assuming 8-hour workday
      const expectedWorkMinutes = 8 * 60;
      const percentage = Math.min((totalMinutesWorked / expectedWorkMinutes) * 100, 100);
      const totalHours = totalMinutesWorked / 60;

      return {
        percentage: Math.round(percentage),
        totalHours: Math.round(totalHours * 10) / 10 // Round to 1 decimal place
      };

    } catch (error) {
      return {
        percentage: 0,
        totalHours: 0
      };
    }
  }

  public async getAttendanceForDate(date: Date): Promise<{ totalHours: number }> {
    try {
      const startOfDayDate = new Date(date.setHours(0, 0, 0, 0));
      const endOfDayDate = new Date(date.setHours(23, 59, 59, 999));

      // Get completed shifts for the day
      const attendanceRecords = await this.attendanceRepository.find({
        where: {
          checkIn: MoreThanOrEqual(startOfDayDate),
          checkOut: LessThanOrEqual(endOfDayDate),
          status: AttendanceStatus.COMPLETED
        }
      });

      let totalMinutesWorked = 0;

      // Calculate minutes from completed shifts
      attendanceRecords.forEach(record => {
        if (record.checkIn && record.checkOut) {
          const minutes = differenceInMinutes(
            new Date(record.checkOut),
            new Date(record.checkIn)
          );
          totalMinutesWorked += minutes;
        }
      });

      // Get active shifts for today
      const activeShifts = await this.attendanceRepository.find({
        where: {
          status: AttendanceStatus.PRESENT,
          checkIn: MoreThanOrEqual(startOfDayDate),
          checkOut: IsNull(),
        }
      });

      // Add minutes from active shifts
      const now = new Date();
      activeShifts.forEach(shift => {
        if (shift.checkIn) {
          const minutes = differenceInMinutes(now, new Date(shift.checkIn));
          totalMinutesWorked += minutes;
        }
      });

      return {
        totalHours: Math.round((totalMinutesWorked / 60) * 10) / 10 // Round to 1 decimal place
      };
    } catch (error) {
      return { totalHours: 0 };
    }
  }

  public async getAttendanceForMonth(ref: string): Promise<{ totalHours: number }> {
    try {
      const user = await this.userService.findOne(ref);
      const userId = user.user.uid;

      // Get completed shifts for the month
      const attendanceRecords = await this.attendanceRepository.find({
        where: {
          owner: { uid: userId },
          checkIn: MoreThanOrEqual(startOfMonth(new Date())),
          checkOut: LessThanOrEqual(endOfMonth(new Date())),
          status: AttendanceStatus.COMPLETED
        }
      });

      // Calculate hours from completed shifts
      const completedHours = attendanceRecords.reduce((total, record) => {
        if (record?.duration) {
          const [hours, minutes] = record.duration.split(' ');
          const hoursValue = parseFloat(hours.replace('h', ''));
          const minutesValue = parseFloat(minutes.replace('m', '')) / 60;
          return total + hoursValue + minutesValue;
        }
        return total;
      }, 0);

      // Get today's attendance hours
      const todayHours = (await this.getAttendanceForDate(new Date())).totalHours;

      const totalHours = completedHours + todayHours;

      return {
        totalHours: Math.round(totalHours * 10) / 10 // Round to 1 decimal place
      };
    } catch (error) {
      return { totalHours: 0 };
    }
  }

  public async getMonthlyAttendanceStats(): Promise<{
    message: string,
    stats: {
      metrics: {
        totalEmployees: number,
        totalPresent: number,
        attendancePercentage: number
      }
    }
  }> {
    try {
      const todayPresent = await this.attendanceRepository.count({
        where: {
          status: AttendanceStatus.PRESENT
        }
      });

      const totalUsers = await this.userService.findAll().then(users => users.users.length);

      const attendancePercentage = totalUsers > 0
        ? Math.round((todayPresent / totalUsers) * 100)
        : 0;

      return {
        message: process.env.SUCCESS_MESSAGE,
        stats: {
          metrics: {
            totalEmployees: totalUsers,
            totalPresent: todayPresent,
            attendancePercentage
          }
        }
      };

    } catch (error) {
      return {
        message: error?.message,
        stats: null
      };
    }
  }

  public async getCurrentShiftHours(userId: number): Promise<number> {
    try {
      const activeShift = await this.attendanceRepository.findOne({
        where: {
          status: AttendanceStatus.PRESENT,
          owner: { uid: userId },
          checkIn: Not(IsNull()),
          checkOut: IsNull(),
        },
        order: {
          checkIn: 'DESC'
        }
      });

      if (activeShift) {
        const now = new Date();
        const checkInTime = new Date(activeShift.checkIn);
        const minutesWorked = differenceInMinutes(now, checkInTime);
        return Math.round((minutesWorked / 60) * 10) / 10; // Round to 1 decimal place
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }
}
