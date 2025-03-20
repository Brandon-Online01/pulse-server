import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationSettingsDto } from './create-organisation-settings.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class UpdateOrganisationSettingsDto extends PartialType(CreateOrganisationSettingsDto) {
	@ApiProperty({
		description: 'Whether to send email notifications to clients when tasks are completed',
		required: false,
	})
	@IsBoolean()
	@IsOptional()
	sendTaskNotifications?: boolean;

	@ApiProperty({
		description: 'Number of days feedback tokens are valid before expiring',
		required: false,
		example: 30,
	})
	@IsNumber()
	@IsOptional()
	feedbackTokenExpiryDays?: number;
} 