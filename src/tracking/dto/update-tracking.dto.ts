import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateTrackingDto } from './create-tracking.dto';
import { IsBoolean, IsNumber, IsObject, IsString, IsInt } from 'class-validator';
import { IsOptional } from 'class-validator';

export class UpdateTrackingDto extends PartialType(CreateTrackingDto) {
    @ApiProperty({
        description: 'Latitude coordinate',
        example: -33.9249,
        required: false
    })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiProperty({
        description: 'Longitude coordinate',
        example: 18.4241,
        required: false
    })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiProperty({
        description: 'Speed in meters per second',
        example: 5.7,
        required: false
    })
    @IsOptional()
    @IsNumber()
    speed?: number;

    @ApiProperty({
        description: 'Heading in degrees (0-360)',
        example: 180.5,
        required: false
    })
    @IsOptional()
    @IsNumber()
    heading?: number;

    @ApiProperty({
        description: 'Altitude in meters above sea level',
        example: 100.2,
        required: false
    })
    @IsOptional()
    @IsNumber()
    altitude?: number;

    @ApiProperty({
        description: 'Accuracy of the GPS reading in meters',
        example: 10.5,
        required: false
    })
    @IsOptional()
    @IsNumber()
    accuracy?: number;

    @ApiProperty({
        description: 'Altitude accuracy in meters',
        example: -1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    altitudeAccuracy?: number;

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

    @ApiProperty({
        description: 'Unique identifier for the device',
        example: 'DEV123456',
        required: false
    })
    @IsOptional()
    @IsString()
    deviceId?: string;

    @ApiProperty({
        description: 'Name of the device',
        example: 'iPhone 13 Pro',
        required: false
    })
    @IsOptional()
    @IsString()
    deviceName?: string;

    @ApiProperty({
        description: 'MAC address of the device',
        example: '00:1A:2B:3C:4D:5E',
        required: false
    })
    @IsOptional()
    @IsString()
    macAddress?: string;

    @ApiProperty({
        description: 'Signal strength in dBm',
        example: -65,
        required: false
    })
    @IsOptional()
    @IsNumber()
    signalStrength?: number;

    @ApiProperty({
        description: 'Whether the tracking device is currently active',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Current status of the tracking device',
        example: 'ONLINE',
        required: false
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({
        description: 'Additional metadata for the tracking record',
        example: { taskId: 123, clientId: 456 },
        required: false
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'Branch associated with this tracking record',
        example: { uid: 1 },
        required: false
    })
    @IsOptional()
    @IsObject()
    branch?: { uid: number };

    @ApiProperty({
        description: 'User who owns this tracking record',
        example: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    owner?: number;
}
