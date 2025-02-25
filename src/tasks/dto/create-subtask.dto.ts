import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubtaskDto {
    @ApiProperty({
        description: 'The title of the subtask',
        example: 'Prepare Meeting Agenda',
        required: true
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Detailed description of the subtask',
        example: 'Create a detailed agenda including all discussion points and time allocations',
        required: true
    })
    @IsString()
    description: string;
} 