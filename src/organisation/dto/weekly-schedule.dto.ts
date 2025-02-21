import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeeklyScheduleDto {
    @ApiProperty({ description: 'Monday availability' })
    @IsBoolean()
    monday: boolean;

    @ApiProperty({ description: 'Tuesday availability' })
    @IsBoolean()
    tuesday: boolean;

    @ApiProperty({ description: 'Wednesday availability' })
    @IsBoolean()
    wednesday: boolean;

    @ApiProperty({ description: 'Thursday availability' })
    @IsBoolean()
    thursday: boolean;

    @ApiProperty({ description: 'Friday availability' })
    @IsBoolean()
    friday: boolean;

    @ApiProperty({ description: 'Saturday availability' })
    @IsBoolean()
    saturday: boolean;

    @ApiProperty({ description: 'Sunday availability' })
    @IsBoolean()
    sunday: boolean;
} 