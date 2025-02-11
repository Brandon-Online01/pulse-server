import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsBoolean, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '../../lib/enums/reports.enums';

export enum ReportPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly',
    CUSTOM = 'custom'
}

export enum ReportFormat {
    JSON = 'json',
    PDF = 'pdf',
    EXCEL = 'excel'
}

export enum ComparisonType {
    YEAR_OVER_YEAR = 'year_over_year',
    MONTH_OVER_MONTH = 'month_over_month',
    CUSTOM = 'custom'
}

export class ReportVisualization {
    @ApiProperty({ enum: ReportFormat, description: 'Report output format' })
    @IsEnum(ReportFormat)
    format: ReportFormat;

    @ApiProperty({ description: 'Include charts in report' })
    @IsOptional()
    @IsObject()
    charts?: Record<string, unknown>;

    @ApiProperty({ description: 'Include tables in report' })
    @IsOptional()
    @IsObject()
    tables?: Record<string, unknown>;
}

export class ReportComparison {
    @ApiProperty({ enum: ComparisonType, description: 'Type of comparison' })
    @IsEnum(ComparisonType)
    type: ComparisonType;

    @ApiProperty({ description: 'Start date for custom comparison' })
    @IsOptional()
    @IsDateString()
    customStartDate?: string;

    @ApiProperty({ description: 'End date for custom comparison' })
    @IsOptional()
    @IsDateString()
    customEndDate?: string;
}

export class ReportFilters {
    @ApiProperty({ description: 'Department IDs to filter by' })
    @IsOptional()
    @IsObject()
    departments?: string[];

    @ApiProperty({ description: 'Team IDs to filter by' })
    @IsOptional()
    @IsObject()
    teams?: string[];

    @ApiProperty({ description: 'Region IDs to filter by' })
    @IsOptional()
    @IsObject()
    regions?: string[];

    @ApiProperty({ description: 'Product IDs to filter by' })
    @IsOptional()
    @IsObject()
    products?: string[];

    @ApiProperty({ description: 'Category IDs to filter by' })
    @IsOptional()
    @IsObject()
    categories?: string[];

    @ApiProperty({ description: 'Status IDs to filter by' })
    @IsOptional()
    @IsObject()
    statuses?: string[];
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

    @ApiProperty({ type: ReportVisualization })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReportVisualization)
    visualization?: ReportVisualization;

    @ApiProperty({ type: ReportComparison })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReportComparison)
    comparison?: ReportComparison;

    @ApiProperty({ type: ReportFilters })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReportFilters)
    filters?: ReportFilters;

    @ApiProperty({ description: 'Specific metrics to include in report' })
    @IsArray()
    @IsOptional()
    metrics?: string[];
} 