import { IsString, IsOptional, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WeeklyScheduleDto } from './weekly-schedule.dto';
import { SpecialHoursDto } from './special-hours.dto';

export class CreateOrganisationHoursDto {
    @ApiProperty({ description: 'Opening time (HH:mm)' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    openTime: string;

    @ApiProperty({ description: 'Closing time (HH:mm)' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    closeTime: string;

    @ApiProperty({ type: WeeklyScheduleDto })
    @ValidateNested()
    @Type(() => WeeklyScheduleDto)
    weeklySchedule: WeeklyScheduleDto;

    @ApiProperty({ type: [SpecialHoursDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SpecialHoursDto)
    specialHours?: SpecialHoursDto[];
} 