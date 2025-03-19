import { PartialType } from '@nestjs/swagger';
import { CreateTaskFlagItemDto } from './create-task-flag-item.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskFlagItemStatus } from '../../lib/enums/task.enums';

export class UpdateTaskFlagItemDto extends PartialType(CreateTaskFlagItemDto) {
    @ApiProperty({
        description: 'Status of the checklist item',
        enum: TaskFlagItemStatus,
        example: TaskFlagItemStatus.COMPLETED,
    })
    @IsEnum(TaskFlagItemStatus)
    @IsOptional()
    status?: TaskFlagItemStatus;
} 