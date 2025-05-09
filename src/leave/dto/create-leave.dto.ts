import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsEnum,
	IsArray,
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsBoolean,
	Min,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveType, HalfDayPeriod } from '../../lib/enums/leave.enums';
import { RecurrencePatternDto } from './recurrence-pattern.dto';
import { ApprovalPathDto } from './approval-path.dto';

export class CreateLeaveDto {
	@ApiProperty({
		description: 'User ID of the leave owner',
		example: 1,
	})
	@IsNumber()
	@IsNotEmpty()
	ownerUid: number;

	@ApiProperty({
		description: 'Type of leave',
		enum: LeaveType,
		example: LeaveType.ANNUAL,
	})
	@IsEnum(LeaveType)
	@IsNotEmpty()
	leaveType: LeaveType;

	@ApiProperty({
		description: 'Start date of the leave',
		example: '2024-12-25',
	})
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	startDate: Date;

	@ApiProperty({
		description: 'End date of the leave',
		example: '2024-12-26',
	})
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	endDate: Date;

	@ApiProperty({
		description: 'Duration of the leave in days',
		example: 2,
	})
	@IsNumber()
	@Min(0.5)
	@IsNotEmpty()
	duration: number;

	@ApiPropertyOptional({
		description: 'Is the leave recurring. If true, recurrencePattern should be provided.',
		example: false,
	})
	@IsBoolean()
	@IsOptional()
	isRecurring?: boolean;

	@ApiPropertyOptional({
		description: 'Pattern for recurring leave. Required if isRecurring is true.',
		type: RecurrencePatternDto,
	})
	@ValidateNested()
	@Type(() => RecurrencePatternDto)
	@IsOptional()
	recurrencePattern?: RecurrencePatternDto;

	@ApiPropertyOptional({
		description: 'Approval path for the leave. Defines who needs to approve.',
		type: ApprovalPathDto,
	})
	@ValidateNested()
	@Type(() => ApprovalPathDto)
	@IsOptional()
	approvalPath?: ApprovalPathDto;

	@ApiProperty({
		description: 'Does the leave require multiple approvals through the approval path.',
		example: false,
	})
	@IsBoolean()
	// @IsNotEmpty() // Making it optional, service can default it if not provided
	@IsOptional()
	requiresMultipleApprovals?: boolean;

	@ApiPropertyOptional({
		description: 'Motivation or reason for the leave',
		example: 'Vacation',
	})
	@IsString()
	@IsOptional()
	motivation?: string;

	@ApiProperty({
		description: 'Is the leave for a half day',
		example: false,
	})
	@IsBoolean()
	@IsNotEmpty()
	isHalfDay: boolean;

	@ApiPropertyOptional({
		description: 'Period if it is a half day leave',
		enum: HalfDayPeriod,
		example: HalfDayPeriod.FIRST_HALF,
	})
	@IsEnum(HalfDayPeriod)
	@IsOptional()
	halfDayPeriod?: HalfDayPeriod;

	@ApiPropertyOptional({
		description: 'Array of attachment URLs',
		example: ['http://example.com/doc1.pdf'],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	attachments?: string[];

	@ApiPropertyOptional({
		description: 'Organisation ID',
		example: 1,
	})
	@IsNumber()
	@IsOptional()
	organisationId?: number;

	@ApiPropertyOptional({
		description: 'Branch ID',
		example: 1,
	})
	@IsNumber()
	@IsOptional()
	branchId?: number;

	@ApiPropertyOptional({
		description: 'Is the leave a public holiday',
		example: false,
	})
	@IsBoolean()
	@IsOptional()
	isPublicHoliday?: boolean;

	@ApiPropertyOptional({
		description: 'Is the leave paid',
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	isPaid?: boolean;

	@ApiPropertyOptional({
		description: 'Paid amount if the leave is paid',
		example: 100,
	})
	@IsNumber()
	@IsOptional()
	paidAmount?: number;

	@ApiPropertyOptional({
		description: 'User ID to whom the work is delegated',
		example: 2,
	})
	@IsNumber()
	@IsOptional()
	delegatedToUid?: number;

	@ApiPropertyOptional({
		description: 'Is the work delegated',
		example: false,
	})
	@IsBoolean()
	@IsOptional()
	isDelegated?: boolean;

	@ApiPropertyOptional({
		description: 'Tags for the leave',
		example: ['important', 'client-related'],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	tags?: string[];
}
