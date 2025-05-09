import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApproverReferenceDto } from './approver-reference.dto';

export class ApprovalPathDto {
	@ApiProperty({
		description: 'Array of approver user IDs, in order of approval',
		type: [ApproverReferenceDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMinSize(1) // Assuming an approval path must have at least one approver
	@Type(() => ApproverReferenceDto)
	@IsNotEmpty()
	approvers: ApproverReferenceDto[];

	@ApiProperty({
		description: 'Index of the current approver in the approvers array (starts from 0)',
		example: 0,
	})
	@IsNumber()
	@IsNotEmpty()
	currentApproverIndex: number;
} 