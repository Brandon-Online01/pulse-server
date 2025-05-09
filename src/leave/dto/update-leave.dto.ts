import { PartialType } from '@nestjs/swagger';
import { CreateLeaveDto } from './create-leave.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { LeaveStatus } from '../../lib/enums/leave.enums';
import { Type } from 'class-transformer';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
	@ApiProperty({
		description: 'Status of the leave',
		enum: LeaveStatus,
		example: LeaveStatus.APPROVED,
		required: false,
	})
	@IsEnum(LeaveStatus)
	@IsOptional()
	status?: LeaveStatus;

	@ApiProperty({
		description: 'User ID of the approver',
		example: 3,
		required: false,
	})
	@IsNumber()
	@IsOptional()
	approvedByUid?: number;

	@ApiProperty({
		description: 'Comments regarding the leave status change',
		example: 'Approved due to urgency.',
		required: false,
	})
	@IsString()
	@IsOptional()
	comments?: string;

	@ApiProperty({
		description: 'Date of approval',
		example: '2024-12-20T10:00:00Z',
		required: false,
	})
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	approvedAt?: Date;
	
	@ApiProperty({
		description: 'Date of rejection',
		example: '2024-12-20T10:00:00Z',
		required: false,
	})
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	rejectedAt?: Date;

	@ApiProperty({
		description: 'Reason for rejection, if applicable',
		example: 'Insufficient staff for the period.',
		required: false,
	})
	@IsString()
	@IsOptional()
	rejectionReason?: string;

	@ApiProperty({
		description: 'Date of cancellation',
		example: '2024-12-21T10:00:00Z',
		required: false,
	})
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	cancelledAt?: Date;

	@ApiProperty({
		description: 'Reason for cancellation, if applicable',
		example: 'Change of plans.',
		required: false,
	})
	@IsString()
	@IsOptional()
	cancellationReason?: string;
}
