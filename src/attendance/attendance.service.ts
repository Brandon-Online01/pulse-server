import { Injectable } from '@nestjs/common';
import { IsNull, Not, Repository } from 'typeorm';
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

  public async checkIn(checkInDto: CreateCheckInDto) {
    const attendance = this.attendanceRepository.create({
      checkIn: checkInDto.checkIn,
      checkInEventTag: checkInDto.checkInEventTag,
      checkInLatitude: checkInDto.checkInLatitude,
      checkInLongitude: checkInDto.checkInLongitude,
      checkInNotes: checkInDto.checkInNotes,
      status: checkInDto.status || AttendanceStatus.PRESENT,
      employeeReferenceCode: checkInDto?.employeeReferenceCode
    });

    return await this.attendanceRepository.save(attendance);
  }

  public async updateAttendance(referenceCode: number, updateAttendanceDto: UpdateAttendanceDto) {
    try {
      const attendance = await this.attendanceRepository.findOne({
        where: {
          uid: referenceCode,
        },
      });

      if (!attendance) {
        throw new Error('check in first!');
      }

      await this.attendanceRepository.update(referenceCode, updateAttendanceDto);

      const response = {
        message: 'updated successfully',
        attendance
      };

      return response;
    } catch (error) {
      throw new Error(`could not update attendance - ${error.message}`);
    }
  }

  public async checkOut(checkOutDto: CreateCheckOutDto) {
    const activeShift = await this.attendanceRepository.findOne({
      where: {
        status: AttendanceStatus.PRESENT,
        employeeReferenceCode: checkOutDto?.employeeReferenceCode,
        checkIn: Not(IsNull()),
        checkOut: IsNull(),
      },
      order: {
        checkIn: 'DESC'
      }
    });

    if (activeShift) {
      activeShift.checkOut = checkOutDto?.checkOut;
      activeShift.checkOutEventTag = checkOutDto?.checkOutEventTag;
      activeShift.checkOutLatitude = checkOutDto?.checkOutLatitude;
      activeShift.checkOutLongitude = checkOutDto?.checkOutLongitude;
      activeShift.checkOutNotes = checkOutDto?.checkOutNotes;
      activeShift.status = AttendanceStatus.COMPLETED;
      return await this.attendanceRepository.save(activeShift);
    }

    throw new Error('no active shift found to check out');
  }
}
