import { IsNotEmpty, IsNumber, IsOptional, IsString, IsObject, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackingDto {
    @ApiProperty({
        description: 'The user ID who owns this tracking record',
        example: 1,
        required: true
    })
    @IsNotEmpty()
    @IsNumber()
    owner: number;

    @ApiProperty({
        description: 'Latitude coordinate',
        example: -33.9249,
        required: true
    })
    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @ApiProperty({
        description: 'Longitude coordinate',
        example: 18.4241,
        required: true
    })
    @IsNotEmpty()
    @IsNumber()
    longitude: number;

    @ApiProperty({
        description: 'Physical address of the location (optional)',
        example: '123 Main St, Cape Town, South Africa',
        required: false
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        description: 'Additional notes about this tracking point (optional)',
        example: 'Client meeting location',
        required: false
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: 'Distance traveled in meters (optional)',
        example: 1500.5,
        required: false
    })
    @IsOptional()
    @IsNumber()
    distance?: number;

    @ApiProperty({
        description: 'Duration in seconds (optional)',
        example: 600,
        required: false
    })
    @IsOptional()
    @IsNumber()
    duration?: number;

    @ApiProperty({
        description: 'Accuracy of the GPS reading in meters',
        example: 5,
        required: false
    })
    @IsOptional()
    @IsNumber()
    accuracy?: number;

    @ApiProperty({
        description: 'Altitude in meters above sea level',
        example: 100.2,
        required: false
    })
    @IsOptional()
    @IsNumber()
    altitude?: number;

    @ApiProperty({
        description: 'Altitude accuracy in meters',
        example: -1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    altitudeAccuracy?: number;

    @ApiProperty({
        description: 'Heading in degrees (0-360)',
        example: -1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    heading?: number;

    @ApiProperty({
        description: 'Speed in meters per second',
        example: -1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    speed?: number;

    @ApiProperty({
        description: 'Timestamp in milliseconds',
        example: 1740670776637,
        required: false
    })
    @IsOptional()
    @IsNumber()
    timestamp?: number;

    @ApiProperty({
        description: 'Battery level percentage (-1 to 100)',
        example: -1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    batteryLevel?: number;

    @ApiProperty({
        description: 'Battery state (0: unknown, 1: charging, 2: discharging, etc.)',
        example: 0,
        required: false
    })
    @IsOptional()
    @IsInt()
    batteryState?: number;

    @ApiProperty({
        description: 'Device brand',
        example: 'Apple',
        required: false
    })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiProperty({
        description: 'Device manufacturer',
        example: 'Apple',
        required: false
    })
    @IsOptional()
    @IsString()
    manufacturer?: string;

    @ApiProperty({
        description: 'Device model ID',
        example: 'arm64',
        required: false
    })
    @IsOptional()
    @IsString()
    modelID?: string;

    @ApiProperty({
        description: 'Device model name',
        example: 'Simulator iOS',
        required: false
    })
    @IsOptional()
    @IsString()
    modelName?: string;

    @ApiProperty({
        description: 'Operating system name',
        example: 'iOS',
        required: false
    })
    @IsOptional()
    @IsString()
    osName?: string;

    @ApiProperty({
        description: 'Operating system version',
        example: '18.1',
        required: false
    })
    @IsOptional()
    @IsString()
    osVersion?: string;

    @ApiProperty({
        description: 'Network information',
        example: { ipAddress: '192.168.0.189', state: { isConnected: true, isInternetReachable: true, type: 'WIFI' } },
        required: false
    })
    @IsOptional()
    @IsObject()
    network?: Record<string, any>;
}
