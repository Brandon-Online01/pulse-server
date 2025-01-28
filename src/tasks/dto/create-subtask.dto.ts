import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubTaskStatus } from '../../lib/enums/status.enums';

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

    @ApiProperty({
        description: 'The current status of the subtask',
        enum: SubTaskStatus,
        example: SubTaskStatus.PENDING,
        default: SubTaskStatus.PENDING,
        required: false
    })
    @IsEnum(SubTaskStatus)
    @IsOptional()
    status?: SubTaskStatus;
} 