import { PartialType } from '@nestjs/swagger';
import { CreateTrackingDto } from './create-tracking.dto';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class UpdateTrackingDto extends PartialType(CreateTrackingDto) {
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsNumber()
    speed?: number;

    @IsOptional()
    @IsNumber()
    heading?: number;

    @IsOptional()
    @IsNumber()
    altitude?: number;

    @IsOptional()
    @IsNumber()
    accuracy?: number;

    @IsOptional()
    @IsString()
    deviceId?: string;

    @IsOptional()
    @IsString()
    deviceName?: string;

    @IsOptional()
    @IsString()
    macAddress?: string;

    @IsOptional()
    @IsNumber()
    batteryLevel?: number;

    @IsOptional()
    @IsNumber()
    signalStrength?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsObject()
    branch?: { uid: number };

    @IsOptional()
    @IsObject()
    owner?: { uid: number };
}
