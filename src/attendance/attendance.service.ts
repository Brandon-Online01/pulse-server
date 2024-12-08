import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus } from 'src/lib/enums/enums';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { isToday } from 'date-fns';
import { BranchService } from 'src/branch/branch.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
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

      return response;
    } catch (error) {

      const response = {
        message: error?.message,
      }

      return response;
    }
  }

  public async checkOut(checkOutDto: CreateCheckOutDto): Promise<{ message: string }> {
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
        const updatedShift = {
          ...activeShift,
          ...checkOutDto,
          status: AttendanceStatus.COMPLETED
        }

        await this.attendanceRepository.save(updatedShift);

        const response = {
          message: process.env.SUCCESS_MESSAGE,
        }

        return response;
      }
    } catch (error) {
      const response = {
        message: error?.message,
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
}
