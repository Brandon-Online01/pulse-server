import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../lib/enums/enums';
import { IsEnum, IsOptional, IsString, IsNumber, IsDate, IsObject, IsNotEmpty } from 'class-validator';

export class CreateCheckInDto {
    @IsEnum(AttendanceStatus)
    @IsOptional()
    @ApiProperty({
        enum: AttendanceStatus,
        required: false,
        example: AttendanceStatus.PRESENT,
        default: AttendanceStatus.PRESENT
    })
    status?: AttendanceStatus;

    @IsDate()
    @ApiProperty({
        type: Date,
        required: true,
        example: `${new Date()}`
    })
    checkIn: Date;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'LR2*2*'
    })
    checkInEventTag?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        type: Number,
        required: false,
        example: 10
    })
    checkInLatitude?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        type: Number,
        required: false,
        example: 10
    })
    checkInLongitude?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'Notes'
    })
    checkInNotes?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'Device mac address'
    })
    checkInDeviceMacAddress?: string;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the attendance check in'
    })
    branch: { uid: number };

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The owner reference code of the attendance check in'
    })
    owner: { uid: number };
} 
