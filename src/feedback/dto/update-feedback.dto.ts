import { IsEnum, IsOptional, IsString, IsNumber, Max, Min } from 'class-validator';
import { FeedbackStatus, FeedbackType } from '../../lib/enums/feedback.enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiProperty({ enum: FeedbackType, enumName: 'FeedbackType', required: false })
  @IsOptional()
  @IsEnum(FeedbackType)
  type?: FeedbackType;

  @ApiProperty({ required: false, description: 'The title of the feedback', example: 'Updated Feedback Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'The comments of the feedback', example: 'Updated feedback comments' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ required: false, description: 'The rating of the feedback', example: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    required: false,
    description: 'The attachments of the feedback',
    example: ['updated-attachment1.jpg', 'updated-attachment2.png'],
  })
  @IsOptional()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ enum: FeedbackStatus, enumName: 'FeedbackStatus', required: false })
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @ApiProperty({ required: false, description: 'Response text to the feedback', example: 'Thank you for your feedback' })
  @IsOptional()
  @IsString()
  responseText?: string;

  @ApiProperty({ required: false, description: 'ID of the user who responded', example: 1 })
  @IsOptional()
  @IsNumber()
  respondedBy?: number;
} 