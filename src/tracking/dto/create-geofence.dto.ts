import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, Max, IsBoolean } from 'class-validator';

/**
 * DTO for creating a new geofence area
 */
export class CreateGeofenceDto {
  @ApiProperty({ description: 'Name of the geofence area' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the geofence area', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Latitude of the center point of the geofence area', minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude of the center point of the geofence area', minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'Radius of the geofence area in meters', minimum: 1 })
  @IsNumber()
  @Min(1)
  radius: number;

  @ApiProperty({ description: 'Whether the geofence area is active', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Organisation ID that owns this geofence area', required: false })
  @IsUUID()
  @IsOptional()
  organisationId?: string;
} 