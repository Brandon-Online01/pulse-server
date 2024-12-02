import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate, IsDecimal } from 'class-validator';

export class CreateCheckOutDto {
    @IsDate()
    @ApiProperty({
        type: Date,
        required: true,
        example: `${new Date()}`
    })
    checkOut: Date;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        type: Number,
        required: false,
        example: 10
    })
    duration?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'Notes for check-out'
    })
    checkOutNotes?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'Check-out event tag'
    })
    checkOutEventTag?: string;

    @IsDecimal()
    @IsOptional()
    @ApiProperty({
        type: Number,
        required: false,
        example: 40.7128
    })
    checkOutLatitude?: number;

    @IsDecimal()
    @IsOptional()
    @ApiProperty({
        type: Number,
        required: false,
        example: -74.0060
    })
    checkOutLongitude?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'XX:XX:XX:XX:XX:XX'
    })
    checkOutDeviceMacAddress?: string;

    @IsString()
    @ApiProperty({
        type: String,
        required: true,
        example: 'EMP123'
    })
    employeeReferenceCode: string;
} 