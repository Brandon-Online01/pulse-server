import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min, Max, IsEnum, IsObject } from 'class-validator';
import { GeofenceEventType } from '../entities/geofence-event.entity';

export class CreateGeofenceEventDto {
  @ApiProperty({ 
    description: 'Type of geofence event (enter or exit)', 
    enum: GeofenceEventType,
    example: 'ENTER'
  })
  @IsEnum(GeofenceEventType)
  eventType: GeofenceEventType;

  @ApiProperty({ 
    description: 'User ID who triggered the geofence event', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ 
    description: 'Geofence ID that was entered or exited',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  geofenceId: string;

  @ApiProperty({ 
    description: 'Latitude where the event occurred', 
    minimum: -90, 
    maximum: 90,
    example: -33.9249
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ 
    description: 'Longitude where the event occurred', 
    minimum: -180, 
    maximum: 180,
    example: 18.4241
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ 
    description: 'Accuracy of the location in meters', 
    required: false,
    example: 10.5
  })
  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @ApiProperty({ 
    description: 'Device information as JSON', 
    required: false,
    example: {
      deviceId: 'iPhone-12-Pro-Max',
      model: 'iPhone 12 Pro Max',
      osVersion: 'iOS 15.4'
    }
  })
  @IsObject()
  @IsOptional()
  deviceInfo?: Record<string, any>;

  @ApiProperty({ 
    description: 'Timestamp when the event occurred', 
    required: false,
    example: 1625097600000
  })
  @IsNumber()
  @IsOptional()
  timestamp?: number;
} 