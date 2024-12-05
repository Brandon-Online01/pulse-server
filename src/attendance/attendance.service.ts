import { Injectable } from '@nestjs/common';
import { IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus } from 'src/lib/enums/enums';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>
  ) { }

  public async checkIn(checkInDto: CreateCheckInDto): Promise<{ message: string }> {
    try {
      const attendance = this.attendanceRepository.create(checkInDto);

      await this.attendanceRepository.save(attendance);

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

  public async updateAttendance(referenceCode: number, updateAttendanceDto: UpdateAttendanceDto): Promise<{ message: string }> {
    try {
      const attendance = await this.attendanceRepository.findOne({
        where: {
          uid: referenceCode,
        },
      });

      if (!attendance) {
        throw new Error('No active check in found');
      }

      await this.attendanceRepository.update(referenceCode, updateAttendanceDto);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      };

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

  public async checkInsByStatus(status: string): Promise<{ message: string, checkIns: Attendance[] }> {
    try {
      const checkIns = await this.attendanceRepository.find({
        where: {
          status: status as AttendanceStatus
        }
      });

      if (!checkIns) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        checkIns
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get check ins by status - ${error.message}`,
        checkIns: null
      }

      return response;
    }
  }
}
