import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
	@IsOptional()   
	@IsString()
	statusChangeReason?: string;

	@IsOptional()
	@IsString()
	statusChangeDescription?: string;
}

