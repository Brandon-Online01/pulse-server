import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SpecialHoursDto {
	@ApiProperty({ description: 'Date for special hours (YYYY-MM-DD)', example: '2025-01-01', required: false })
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@IsOptional()
	date?: string;

	@ApiProperty({ description: 'Opening time (HH:mm)', example: '08:00', required: false })
	@IsString()
	@Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
	@IsOptional()
	openTime?: string;

	@ApiProperty({ description: 'Closing time (HH:mm)', example: '18:00', required: false })
	@IsString()
	@Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
	@IsOptional()
	closeTime?: string;
}
