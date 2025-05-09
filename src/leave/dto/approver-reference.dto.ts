import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ApproverReferenceDto {
	@ApiProperty({ description: 'User ID of the approver', example: 1 })
	@IsNumber()
	@IsNotEmpty()
	uid: number;
} 