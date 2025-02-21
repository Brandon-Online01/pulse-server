import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SpecialHoursDto {
    @ApiProperty({ description: 'Date for special hours (YYYY-MM-DD)' })
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    date: string;

    @ApiProperty({ description: 'Opening time (HH:mm)' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    openTime: string;

    @ApiProperty({ description: 'Closing time (HH:mm)' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    closeTime: string;
} 