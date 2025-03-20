import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeeklyScheduleDto {
	@ApiProperty({ description: 'Monday availability', example: true, required: false })
	@IsBoolean()
	monday: boolean;

	@ApiProperty({ description: 'Tuesday availability', example: true, required: false })
	@IsBoolean()
	tuesday: boolean;

	@ApiProperty({ description: 'Wednesday availability', example: true, required: false })
	@IsBoolean()
	wednesday: boolean;

	@ApiProperty({ description: 'Thursday availability', example: true, required: false })
	@IsBoolean()
	thursday: boolean;

	@ApiProperty({ description: 'Friday availability', example: true, required: false })
	@IsBoolean()
	friday: boolean;

	@ApiProperty({ description: 'Saturday availability', example: true, required: false })
	@IsBoolean()
	saturday: boolean;

	@ApiProperty({ description: 'Sunday availability', example: true, required: false })
	@IsBoolean()
	sunday: boolean;
}
