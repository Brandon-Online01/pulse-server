import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportType } from '../../lib/enums/reports.enums';

export enum ReportPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

export class GenerateReportDto {
    @ApiProperty({
        description: 'Start date for the report period',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: 'End date for the report period',
        example: '2024-01-31T23:59:59.999Z',
    })
    @IsDateString()
    endDate: string;

    @ApiProperty({
        enum: ReportPeriod,
        description: 'Period type for the report',
        example: ReportPeriod.MONTHLY,
    })
    @IsEnum(ReportPeriod)
    period: ReportPeriod;

    @ApiProperty({
        enum: ReportType,
        description: 'Type of report to generate',
        example: ReportType.LEAD,
    })
    @IsEnum(ReportType)
    type: ReportType;
} 