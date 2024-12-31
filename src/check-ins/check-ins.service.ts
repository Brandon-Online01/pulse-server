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

  async checkOut(createCheckOutDto: CreateCheckOutDto): Promise<{ message: string, duration?: string }> {
    try {

      console.log(createCheckOutDto, 'checkout data');

      const checkIn = await this.checkInRepository.findOne({
        where: {
          owner: {
            uid: createCheckOutDto.owner.uid
          }
        },
        order: {
          checkInTime: 'DESC'
        }
      });

      if (!checkIn) {
        throw new NotFoundException('Check-in not found');
      }

      console.log(checkIn, 'checkIn');

      const checkOutTime = new Date(createCheckOutDto.checkOutTime);
      const checkInTime = new Date(checkIn.checkInTime);

      const minutesWorked = differenceInMinutes(checkOutTime, checkInTime);
      const hoursWorked = differenceInHours(checkOutTime, checkInTime);
      const remainingMinutes = minutesWorked % 60;

      const duration = `${hoursWorked}h ${remainingMinutes}m`;

      await this.checkInRepository.update(checkIn.uid, {
        checkOutTime: createCheckOutDto?.checkOutTime,
        checkOutPhoto: createCheckOutDto?.checkOutPhoto,
        checkOutLocation: createCheckOutDto?.checkOutLocation,
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
        ? 'checkOut'
        : 'checkIn';

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        nextAction,
        checkedIn: nextAction === 'checkOut',
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
