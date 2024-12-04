import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, IsNotEmpty } from "class-validator";
import { Point } from "typeorm";

export class CreateTrackingDto {
    @IsOptional()
    @ApiProperty({
        description: 'The geographical location point',
        example: {
            type: 'Point',
            coordinates: ['121.4737', '14.5995']
        },
        required: false,
    })
    location?: Point;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Speed in specified units',
        example: 45.50,
        required: false,
    })
    speed?: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Heading direction in degrees',
        example: 180.00,
        required: false,
    })
    heading?: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Altitude in meters',
        example: 1250.75,
        required: false,
    })
    altitude?: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Location accuracy in meters',
        example: 10.5,
        required: false,
    })
    accuracy?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Unique identifier of the device',
        example: 'DEV123456',
        required: false,
    })
    deviceId?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Name of the device',
        example: 'iPhone 12 Pro',
        required: false,
    })
    deviceName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'MAC address of the device',
        example: '00:11:22:33:44:55',
        required: false,
    })
    macAddress?: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Battery level percentage',
        example: 85.5,
        required: false,
    })
    batteryLevel?: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Signal strength indicator',
        example: -65,
        required: false,
    })
    signalStrength?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Whether the tracking record is active',
        example: true,
        default: true,
    })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Current status of the tracking',
        example: 'ACTIVE',
        required: false,
    })
    status?: string;

    @IsOptional()
    @IsObject()
    @ApiProperty({
        description: 'Additional metadata about the tracking event',
        example: {
            browser: 'Chrome',
            ip: '192.168.1.1',
            customField: 'value'
        },
        required: false,
    })
    metadata?: Record<string, any>;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the tracking'
    })
    branch: { uid: number };

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The owner reference code of the journal',
        example: { uid: 1 },
    })
    owner: { uid: number };

}
