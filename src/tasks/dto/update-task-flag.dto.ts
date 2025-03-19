import { PartialType } from '@nestjs/swagger';
import { CreateTaskFlagDto } from './create-task-flag.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskFlagStatus } from '../../lib/enums/task.enums';

export class UpdateTaskFlagDto extends PartialType(CreateTaskFlagDto) {
    @ApiProperty({
        description: 'Status of the task flag',
        enum: TaskFlagStatus,
        example: TaskFlagStatus.RESOLVED,
        required: false,
    })
    @IsEnum(TaskFlagStatus)
    @IsOptional()
    status?: TaskFlagStatus;
} 