import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDate, IsNotEmpty, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { WarningSeverity, WarningStatus } from '../entities/warning.entity';

export class CreateWarningDto {
	@IsObject()
	@IsNotEmpty()
	@ApiProperty({
		description: 'User who will receive the warning',
		example: { uid: 1 },
		required: true,
	})
	owner: { uid: number };

	@IsObject()
	@IsNotEmpty()
	@ApiProperty({
		description: 'User who is issuing the warning',
		example: { uid: 2 },
		required: true,
	})
	issuedBy: { uid: number };

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Reason for the warning',
		example: 'Failure to meet performance standards',
		required: true,
	})
	reason: string;

	@IsEnum(WarningSeverity)
	@IsNotEmpty()
	@ApiProperty({
		description: 'Severity level of the warning',
		enum: WarningSeverity,
		example: WarningSeverity.MEDIUM,
		required: true,
	})
	severity: WarningSeverity;

	@IsDate()
	@Type(() => Date)
	@ApiProperty({
		description: 'Date when the warning was issued',
		example: '2023-05-15T10:30:00Z',
		required: false,
	})
	issuedAt?: Date;

	@IsDate()
	@Type(() => Date)
	@IsNotEmpty()
	@ApiProperty({
		description: 'Date when the warning expires',
		example: '2023-11-15T10:30:00Z',
		required: true,
	})
	expiresAt: Date;

	@IsEnum(WarningStatus)
	@ApiProperty({
		description: 'Status of the warning',
		enum: WarningStatus,
		example: WarningStatus.ACTIVE,
		required: false,
		default: WarningStatus.ACTIVE,
	})
	status?: WarningStatus;
}
