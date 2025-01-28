import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSubtaskDto } from './create-subtask.dto';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { SubTaskStatus } from '../../lib/enums/status.enums';

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
    @ApiProperty({
        description: 'The title of the subtask',
        example: 'Updated Meeting Agenda',
        required: false
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: 'Detailed description of the subtask',
        example: 'Updated agenda with new discussion points and revised time allocations',
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
        description: 'Is the subtask deleted'
    })
    isDeleted?: boolean;
} 