import { Injectable } from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracking } from './entities/tracking.entity';
import { DeepPartial, Repository, IsNull } from 'typeorm';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Tracking)
    private trackingRepository: Repository<Tracking>,
  ) { }

  async create(createTrackingDto: CreateTrackingDto) {
    try {
      const tracking = this.trackingRepository.create(createTrackingDto as unknown as DeepPartial<Tracking>);
      await this.trackingRepository.save(tracking);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      }

      return response;
    } catch (error) {
      const response = {
        message: error.message,
      }

      return response;
    }
  }

  async findAll(): Promise<{ tracking: Tracking[] | null, message: string }> {
    try {
      const tracking = await this.trackingRepository.find({
        where: {
          deletedAt: IsNull()
        }
      });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        tracking: tracking
      }

      return response;
    } catch (error) {
      const response = {
        message: error.message,
        tracking: null
      }

      return response;
    }
  }

  async findOne(referenceCode: number): Promise<{ tracking: Tracking | null, message: string }> {
    try {
      const tracking = await this.trackingRepository.findOne({
        where: {
          uid: referenceCode,
          deletedAt: IsNull()
        },
        relations: ['branch', 'owner']
      });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        tracking: tracking
      }

      return response;
    } catch (error) {
      const response = {
        message: error.message,
        tracking: null
      }

      return response;
    }
  }

  async update(referenceCode: number, updateTrackingDto: UpdateTrackingDto) {
    try {
      await this.trackingRepository.update(referenceCode, updateTrackingDto as unknown as DeepPartial<Tracking>);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      const response = {
        message: error.message,
      }

      return response;
    }
  }

  async remove(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.trackingRepository.update(
        referenceCode,
        {
          deletedAt: new Date(),
          deletedBy: 'system'
        }
      );

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      const response = {
        message: error.message,
      }

      return response;
    }
  }

  async restore(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.trackingRepository.update(
        referenceCode,
        {
          deletedAt: null,
          deletedBy: null
        }
      );

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      const response = {
        message: error.message,
      }

      return response;
    }
  }
}
