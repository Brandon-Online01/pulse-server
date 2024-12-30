import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { Repository } from 'typeorm';
import { CheckIn } from './entities/check-in.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
import { differenceInMinutes, differenceInHours } from 'date-fns';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
  ) { }

  async checkIn(createCheckInDto: CreateCheckInDto): Promise<{ message: string }> {
    try {
      await this.checkInRepository.save(createCheckInDto);

      console.log(createCheckInDto, 'check in data');

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

  async checkOut(createCheckOutDto: CreateCheckOutDto, reference: number): Promise<{ message: string, duration?: string }> {
    try {
      const checkIn = await this.checkInRepository.findOne({ where: { uid: reference } });

      if (!checkIn) {
        throw new NotFoundException('Check-in not found');
      }

      const checkOutTime = new Date(createCheckOutDto.checkOutTime);
      const checkInTime = new Date(checkIn.checkInTime);

      const minutesWorked = differenceInMinutes(checkOutTime, checkInTime);
      const hoursWorked = differenceInHours(checkOutTime, checkInTime);
      const remainingMinutes = minutesWorked % 60;

      const duration = `${hoursWorked}h ${remainingMinutes}m`;

      await this.checkInRepository.update(reference, {
        checkOutTime: createCheckOutDto.checkOutTime,
        checkOutPhoto: createCheckOutDto.checkOutPhoto,
        checkOutLocation: createCheckOutDto.checkOutLocation,
        duration: duration,
      });

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

  async checkInStatus(reference: number): Promise<any> {
    try {
      const [checkIn] = await this.checkInRepository.find({
        where: {
          owner: {
            uid: reference
          }
        },
        order: {
          checkInTime: 'DESC'
        }
      });

      if (!checkIn) {
        throw new NotFoundException('Check-in not found');
      }

      const nextAction = checkIn.checkInTime && checkIn.checkInLocation && !checkIn.checkOutTime
        ? 'Check Out'
        : 'Check In';

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        nextAction,
        checkedIn: nextAction === 'Check Out',
        ...checkIn
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        nextAction: 'Check In',
        checkedIn: false
      }

      return response;
    }
  }
}
