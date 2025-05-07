import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Reason for the lead status change',
		example: 'Client requested a follow-up meeting.',
		required: false,
	})
	statusChangeReason?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Detailed description of the lead status change',
		example: 'Follow-up meeting scheduled for next week to discuss proposal details.',
		required: false,
	})
	statusChangeDescription?: string;
}
