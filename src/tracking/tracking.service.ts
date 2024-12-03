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
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const tracking = await this.trackingRepository.find({
        where: {
          deletedAt: IsNull()
        }
      });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(referenceCode: number) {
    try {
      const tracking = await this.trackingRepository.findOne({
        where: {
          uid: referenceCode,
          deletedAt: IsNull()
        }
      });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(referenceCode: number, updateTrackingDto: UpdateTrackingDto) {
    try {
      const tracking = await this.trackingRepository.update(referenceCode, updateTrackingDto as unknown as DeepPartial<Tracking>);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(referenceCode: number) {
    try {
      const tracking = await this.trackingRepository.update(
        referenceCode,
        {
          deletedAt: new Date(),
          deletedBy: 'system'
        }
      );

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async restore(referenceCode: number) {
    try {
      const tracking = await this.trackingRepository.update(
        referenceCode,
        {
          deletedAt: null,
          deletedBy: null
        }
      );

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
