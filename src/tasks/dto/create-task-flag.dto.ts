import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTaskFlagItemDto } from './create-task-flag-item.dto';

export class CreateTaskFlagDto {
	@ApiProperty({
		description: 'Title of the task flag',
		example: 'Issue with client requirements',
		required: true,
	})
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({
		description: 'Detailed description of why the task is being flagged',
		example: 'Client requirements were unclear and need further clarification',
		required: true,
	})
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({
		description: 'ID of the task being flagged',
		example: 123,
		required: true,
	})
	@IsNumber()
	@IsNotEmpty()
	taskId: number;

	@ApiProperty({
		description: 'Deadline for resolving the flag (ISO format)',
		example: '2023-12-31T23:59:59Z',
		required: false,
	})
	@IsDateString()
	@IsOptional()
	deadline?: string;

	@ApiProperty({
		description: 'Initial comment on the flag',
		example: 'This task needs urgent attention because...',
		required: false,
	})
	@IsString()
	@IsOptional()
	comment?: string;

	@ApiProperty({
		description: 'List of checklist items for the flagged task',
		type: [CreateTaskFlagItemDto],
		required: false,
	})
	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CreateTaskFlagItemDto)
	items?: CreateTaskFlagItemDto[];

	@ApiProperty({
		description: 'List of attachment URLs',
		type: [String],
		required: false,
	})
	@IsArray()
	@IsOptional()
	attachments?: string[];
}
