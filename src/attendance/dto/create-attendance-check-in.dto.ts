import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from 'src/lib/enums/enums';
import { IsEnum, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

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

    @IsString()
    @ApiProperty({
        type: String,
        required: true,
        example: 'Employee reference code'
    })
    employeeReferenceCode: string;
} 