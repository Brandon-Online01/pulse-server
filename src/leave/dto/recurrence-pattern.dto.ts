import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RecurrencePatternDto {
	@ApiProperty({
		description: 'Frequency of recurrence',
		enum: ['daily', 'weekly', 'monthly', 'yearly'],
		example: 'weekly',
	})
	@IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
	@IsNotEmpty()
	frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

	@ApiProperty({ description: 'Interval of recurrence based on frequency', example: 1 })
	@IsNumber()
	@IsNotEmpty()
	interval: number;

	@ApiPropertyOptional({ description: 'End date for the recurrence', example: '2025-12-31' })
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	endDate?: Date;

	@ApiPropertyOptional({
		description: 'Specific dates to be excluded from recurrence',
		type: [String], // Representing dates
		example: ['2024-07-04', '2024-09-02'],
	})
	@IsArray()
	@Type(() => Date) // Ensure transformation if string dates are sent
	@IsDate({ each: true })
	@IsOptional()
	exceptions?: Date[];
} 