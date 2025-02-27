import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, Max, IsBoolean } from 'class-validator';

export class UpdateGeofenceDto {
  @ApiProperty({ 
    description: 'Name of the geofence area', 
    required: false,
    example: 'Updated Office Perimeter'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Description of the geofence area', 
    required: false,
    example: 'Updated geofence area around the main office building'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Latitude of the center point of the geofence area', 
    minimum: -90, 
    maximum: 90, 
    required: false,
    example: -33.9249
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({ 
    description: 'Longitude of the center point of the geofence area', 
    minimum: -180, 
    maximum: 180, 
    required: false,
    example: 18.4241
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({ 
    description: 'Radius of the geofence area in meters', 
    minimum: 1, 
    required: false,
    example: 750
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  radius?: number;

  @ApiProperty({ 
    description: 'Whether the geofence area is active', 
    required: false,
    example: false
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