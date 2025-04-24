import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { InteractionType } from '../../lib/enums/interaction.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInteractionDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty({ description: 'The message of the interaction', example: 'This is a test message', required: true })
	message: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The URL of the attachment',
		example: 'https://example.com/attachment.jpg',
		required: false,
	})
	attachmentUrl?: string;

	@IsOptional()
	@IsEnum(InteractionType)
	@ApiProperty({ description: 'The type of the interaction', example: InteractionType.EMAIL, required: false })
	type?: InteractionType;

	@IsNotEmpty()
	@ApiProperty({ description: 'The user who created the interaction', example: 'John Doe', required: true })
	createdBy: any; // User entity

	@IsOptional()
	@IsNumber()
	@ApiProperty({ description: 'The lead reference code', example: 1, required: false })
	leadUid?: number;

	@IsOptional()
	@IsNumber()
	@ApiProperty({ description: 'The client reference code', example: 1, required: false })
	clientUid?: number;
}
