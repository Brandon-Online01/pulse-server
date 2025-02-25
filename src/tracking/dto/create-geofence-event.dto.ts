import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, Max, IsEnum, IsObject } from 'class-validator';
import { GeofenceEventType } from '../entities/geofence-event.entity';

/**
 * DTO for creating a new geofence event
 */
export class CreateGeofenceEventDto {
  @ApiProperty({ description: 'Type of geofence event (enter or exit)', enum: GeofenceEventType })
  @IsEnum(GeofenceEventType)
  eventType: GeofenceEventType;

  @ApiProperty({ description: 'User ID who triggered the geofence event', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Geofence ID that was entered or exited' })
  @IsUUID()
  geofenceId: string;

  @ApiProperty({ description: 'Latitude where the event occurred', minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude where the event occurred', minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'Accuracy of the location in meters', required: false })
  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @ApiProperty({ description: 'Device information as JSON', required: false })
  @IsObject()
  @IsOptional()
  deviceInfo?: Record<string, any>;

  @ApiProperty({ description: 'Timestamp when the event occurred', required: false })
  @IsNumber()
  @IsOptional()
  timestamp?: number;
} 