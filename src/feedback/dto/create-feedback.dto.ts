import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { FeedbackType } from '../../lib/enums/feedback.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
	@ApiProperty({ enum: FeedbackType, enumName: 'FeedbackType', required: true })
	@IsNotEmpty()
	@IsEnum(FeedbackType)
	type: FeedbackType;

	@ApiProperty({ required: true, description: 'The title of the feedback', example: 'Feedback Title' })
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({ required: true, description: 'The comments of the feedback', example: 'Feedback Comments' })
	@IsString()
	comments: string;

	@ApiProperty({ required: false, description: 'The rating of the feedback', example: 5 })
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(5)
	rating?: number;

	@ApiProperty({
		required: false,
		description: 'The attachments of the feedback',
		example: ['attachment1.jpg', 'attachment2.png'],
	})
	@IsOptional()
	@IsString({ each: true })
	attachments?: string[];

	@ApiProperty({ required: false, description: 'The token of the feedback', example: '1234567890' })
	@IsOptional()
	@IsString()
	token?: string;

	@ApiProperty({ required: false, description: 'The client ID of the feedback', example: 1 })
	@IsOptional()
	@IsNumber()
	clientId?: number;

	@ApiProperty({ required: false, description: 'The organisation ID of the feedback', example: 1 })
	@IsOptional()
	@IsNumber()
	organisationId?: number;

	@ApiProperty({ required: false, description: 'The branch ID of the feedback', example: 1 })
	@IsOptional()
	@IsNumber()
	branchId?: number;

	@ApiProperty({ required: false, description: 'The task ID of the feedback', example: 1 })
	@IsOptional()
	@IsNumber()
	taskId?: number;
}
