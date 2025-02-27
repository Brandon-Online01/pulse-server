import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, Max, IsBoolean } from 'class-validator';

export class CreateGeofenceDto {
  @ApiProperty({ 
    description: 'Name of the geofence area',
    example: 'Office Perimeter'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Description of the geofence area', 
    required: false,
    example: 'Geofence area around the main office building'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Latitude of the center point of the geofence area', 
    minimum: -90, 
    maximum: 90,
    example: -33.9249
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ 
    description: 'Longitude of the center point of the geofence area', 
    minimum: -180, 
    maximum: 180,
    example: 18.4241
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ 
    description: 'Radius of the geofence area in meters', 
    minimum: 1,
    example: 500
  })
  @IsNumber()
  @Min(1)
  radius: number;

  @ApiProperty({ 
    description: 'Whether the geofence area is active', 
    required: false, 
    default: true,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Organisation ID that owns this geofence area', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsOptional()
  organisationId?: string;
} 