import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskFlagItemDto {
    @ApiProperty({
        description: 'Title of the checklist item',
        example: 'Contact client for requirements clarification',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Description of the checklist item',
        example: 'Call the client to clarify the requirements for the project',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
} 