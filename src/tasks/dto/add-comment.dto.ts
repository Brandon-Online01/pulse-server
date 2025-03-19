import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
    @ApiProperty({
        description: 'Comment content',
        example: 'I contacted the client to discuss this issue',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    content: string;
} 