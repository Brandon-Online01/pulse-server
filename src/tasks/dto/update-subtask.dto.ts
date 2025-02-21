import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SubTaskStatus } from '../../lib/enums/status.enums';

export class UpdateSubtaskDto {
    @ApiProperty({
        description: 'The title of the subtask',
        example: 'Sub Task One',
        required: false
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: 'Detailed description of the subtask',
        example: 'Sub task description',
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The current status of the subtask',
        enum: SubTaskStatus,
        example: SubTaskStatus.COMPLETED,
        required: false
    })
    @IsEnum(SubTaskStatus)
    @IsOptional()
    status?: SubTaskStatus;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: false,
        description: 'Is the subtask deleted',
        required: false
    })
    isDeleted?: boolean;
} 