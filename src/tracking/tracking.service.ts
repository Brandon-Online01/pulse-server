import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracking } from './entities/tracking.entity';
import { DeepPartial, Repository, IsNull, Between } from 'typeorm';
import { LocationUtils } from '../lib/utils/location.utils';
import { startOfDay, endOfDay } from 'date-fns';
import axios from 'axios';

@Injectable()
export class TrackingService {
  private readonly geocodingApiKey: string;

  constructor(
    @InjectRepository(Tracking)
    private trackingRepository: Repository<Tracking>,
  ) {
    this.geocodingApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  async create(createTrackingDto: CreateTrackingDto) {
    try {
      // Get address from coordinates
      const address = await this.getAddressFromCoordinates(createTrackingDto.latitude, createTrackingDto.longitude);

      const tracking = this.trackingRepository.create({
        ...createTrackingDto,
        address,
      } as DeepPartial<Tracking>);

      await this.trackingRepository.save(tracking);

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking
      };
    } catch (error) {
      return {
        message: error.message,
        tracking: null
      };
    }
  }

  private async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.geocodingApiKey}`
      );

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async getDailyTracking(userId: number, date: Date = new Date()) {
    try {
      const trackingPoints = await this.trackingRepository.find({
        where: {
          owner: { uid: userId },
          createdAt: Between(startOfDay(date), endOfDay(date))
        },
        order: {
          createdAt: 'ASC'
        }
      });

      if (!trackingPoints.length) {
        return {
          message: 'No tracking data found for the specified date',
          data: null
        };
      }

      const totalDistance = LocationUtils.calculateTotalDistance(trackingPoints);
      const formattedDistance = LocationUtils.formatDistance(totalDistance);

      // Group tracking points by address for time analysis
      const locationTimeSpent = this.calculateTimeSpentAtLocations(trackingPoints);
      const averageTimePerLocation = this.calculateAverageTimePerLocation(locationTimeSpent);

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: {
          totalDistance: formattedDistance,
          trackingPoints,
          locationAnalysis: {
            timeSpentByLocation: locationTimeSpent,
            averageTimePerLocation: averageTimePerLocation
          }
        }
      };
    } catch (error) {
      return {
        message: error.message,
        data: null
      };
    }
  }

  private calculateTimeSpentAtLocations(trackingPoints: Tracking[]) {
    const locationMap = new Map<string, number>();

    for (let i = 0; i < trackingPoints.length - 1; i++) {
      const currentPoint = trackingPoints[i];
      const nextPoint = trackingPoints[i + 1];
      const timeSpent = (new Date(nextPoint.createdAt).getTime() - new Date(currentPoint.createdAt).getTime()) / 1000 / 60; // in minutes

      if (currentPoint.address) {
        locationMap.set(
          currentPoint.address,
          (locationMap.get(currentPoint.address) || 0) + timeSpent
        );
      }
    }

    return Object.fromEntries(locationMap);
  }

  private calculateAverageTimePerLocation(locationTimeSpent: Record<string, number>): number {
    const locations = Object.values(locationTimeSpent);
    if (!locations.length) return 0;
    return locations.reduce((sum, time) => sum + time, 0) / locations.length;
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

  async findOne(ref: number): Promise<{ tracking: Tracking | null, message: string }> {
    try {
      const tracking = await this.trackingRepository.findOne({
        where: {
          uid: ref,
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

  public async trackingByUser(ref: number): Promise<{ message: string, tracking: Tracking[] }> {
    try {
      const tracking = await this.trackingRepository.find({
        where: { owner: { uid: ref } }
      });

      if (!tracking) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        tracking
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get tracking by user - ${error?.message}`,
        tracking: null
      }

      return response;
    }
  }

  async update(ref: number, updateTrackingDto: UpdateTrackingDto) {
    try {
      await this.trackingRepository.update(ref, updateTrackingDto as unknown as DeepPartial<Tracking>);

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

  async remove(ref: number): Promise<{ message: string }> {
    try {
      await this.trackingRepository.update(
        ref,
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

  async restore(ref: number): Promise<{ message: string }> {
    try {
      await this.trackingRepository.update(
        ref,
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
