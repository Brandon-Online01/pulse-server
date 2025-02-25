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
      // Get address from coordinates with retries and fallback
      const { address, error: geocodingError } = await this.getAddressFromCoordinates(
        createTrackingDto.latitude,
        createTrackingDto.longitude
      );

      const tracking = this.trackingRepository.create({
        ...createTrackingDto,
        address,
        addressDecodingError: geocodingError || null,
        // Store raw coordinates as fallback
        rawLocation: `${createTrackingDto.latitude},${createTrackingDto.longitude}`,
      } as DeepPartial<Tracking>);

      await this.trackingRepository.save(tracking);

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: tracking,
        warnings: geocodingError ? [{ type: 'GEOCODING_ERROR', message: geocodingError }] : []
      };
    } catch (error) {
      return {
        message: error.message,
        tracking: null,
        warnings: []
      };
    }
  }

  private async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<{ address: string | null; error?: string }> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (!this.geocodingApiKey) {
          return {
            address: null,
            error: 'Geocoding API key not configured'
          };
        }

        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.geocodingApiKey}`,
          { timeout: 5000 } // 5 second timeout
        );

        if (response.data.status === 'ZERO_RESULTS') {
          return {
            address: null,
            error: 'No address found for these coordinates'
          };
        }

        if (response.data.status !== 'OK') {
          return {
            address: null,
            error: `Geocoding API error: ${response.data.status}`
          };
        }

        if (response.data.results && response.data.results.length > 0) {
          return {
            address: response.data.results[0].formatted_address
          };
        }

        return {
          address: null,
          error: 'No results in geocoding response'
        };

      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;

        if (error.response?.status === 429) { // Rate limit error
          if (!isLastAttempt) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            continue;
          }
          return {
            address: null,
            error: 'Geocoding API rate limit exceeded'
          };
        }

        if (isLastAttempt) {
          console.error('Geocoding error after max retries:', {
            error: error.message,
            coordinates: { latitude, longitude },
            attempts: attempt
          });

          return {
            address: null,
            error: `Geocoding failed: ${error.message}`
          };
        }

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }

    return {
      address: null,
      error: 'Max retries exceeded for geocoding request'
    };
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

  /**
   * Records a user stop event
   * @param stopData Data about the stop location and duration
   * @param userId The user ID who made the stop
   * @returns Response with the created stop record
   */
  async createStopEvent(stopData: {
    latitude: number;
    longitude: number;
    startTime: number;
    endTime: number;
    duration: number;
    address?: string;
  }, userId: number) {
    try {
      // If no address is provided, try to get it from coordinates
      if (!stopData.address) {
        const { address } = await this.getAddressFromCoordinates(
          stopData.latitude,
          stopData.longitude
        );
        
        if (address) {
          stopData.address = address;
        }
      }

      // Create a tracking record for the stop
      const tracking = this.trackingRepository.create({
        latitude: stopData.latitude,
        longitude: stopData.longitude,
        owner: { uid: userId },
        address: stopData.address,
        // Store raw coordinates as fallback
        rawLocation: `${stopData.latitude},${stopData.longitude}`,
        // Add stop-specific data
        metadata: {
          isStop: true,
          startTime: new Date(stopData.startTime).toISOString(),
          endTime: new Date(stopData.endTime).toISOString(),
          durationMinutes: Math.round(stopData.duration / 60000), // Convert ms to minutes
        }
      } as DeepPartial<Tracking>);

      await this.trackingRepository.save(tracking);

      return {
        message: 'Stop event recorded successfully',
        data: tracking
      };
    } catch (error) {
      return {
        message: `Failed to record stop event: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * Gets all stops for a specific user
   * @param userId The user ID to get stops for
   * @returns List of stop events
   */
  async getUserStops(userId: number) {
    try {
      // Use raw query to find records with stop metadata
      const stops = await this.trackingRepository
        .createQueryBuilder('tracking')
        .where('tracking.owner.uid = :userId', { userId })
        .andWhere('tracking.deletedAt IS NULL')
        .andWhere("JSON_EXTRACT(tracking.metadata, '$.isStop') = :isStop", { isStop: true })
        .orderBy('tracking.createdAt', 'DESC')
        .getMany();

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: stops
      };
    } catch (error) {
      return {
        message: `Failed to get user stops: ${error.message}`,
        data: null
      };
    }
  }
}
