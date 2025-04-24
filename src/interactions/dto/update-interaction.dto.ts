import { PartialType } from '@nestjs/mapped-types';
import { CreateInteractionDto } from './create-interaction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from 'src/lib/enums/interaction.enums';

export class UpdateInteractionDto extends PartialType(CreateInteractionDto) {
	@ApiProperty({ description: 'The message of the interaction', example: 'This is a test message', required: true })
	message: string;

	@ApiProperty({
		description: 'The URL of the attachment',
		example: 'https://example.com/attachment.jpg',
		required: false,
	})
	attachmentUrl?: string;

	@ApiProperty({ description: 'The type of the interaction', example: InteractionType.EMAIL, required: false })
	type?: InteractionType;
}
