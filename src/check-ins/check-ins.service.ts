import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { Repository } from 'typeorm';
import { CheckIn } from './entities/check-in.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
import { differenceInMinutes, differenceInHours } from 'date-fns';
import { RewardsService } from 'src/rewards/rewards.service';
import { XP_VALUES_TYPES } from 'src/lib/constants/constants';
import { XP_VALUES } from 'src/lib/constants/constants';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
    private rewardsService: RewardsService,
  ) { }

  async checkIn(createCheckInDto: CreateCheckInDto): Promise<{ message: string }> {
    try {
      if (!createCheckInDto?.owner) {
        throw new BadRequestException(process.env.NOT_FOUND_MESSAGE);
      }

      if (!createCheckInDto?.branch) {
        throw new BadRequestException(process.env.NOT_FOUND_MESSAGE);
      }

      await this.checkInRepository.save(createCheckInDto);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      await this.rewardsService.awardXP({
        owner: createCheckInDto.owner.uid,
        amount: XP_VALUES.CHECK_IN_CLIENT,
        action: XP_VALUES_TYPES.CHECK_IN_CLIENT,
        source: {
          id: String(createCheckInDto.owner),
          type: XP_VALUES_TYPES.CHECK_IN_CLIENT,
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

  async checkOut(createCheckOutDto: CreateCheckOutDto): Promise<{ message: string, duration?: string }> {
    try {
      if (!createCheckOutDto?.owner) {
        throw new BadRequestException(process.env.NOT_FOUND_MESSAGE);
      }

      if (!createCheckOutDto?.branch) {
        throw new BadRequestException(process.env.NOT_FOUND_MESSAGE);
      }

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
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

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

      await this.rewardsService.awardXP({
        owner: createCheckOutDto.owner.uid,
        amount: 10,
        action: 'CHECK_OUT',
        source: {
          id: createCheckOutDto.owner.toString(),
          type: 'check-in',
          details: 'Check-out reward'
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
        },
        relations: ['owner', 'client']
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
