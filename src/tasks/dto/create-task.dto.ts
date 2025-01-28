import { IsString, IsOptional, IsEnum, IsArray, IsDate } from 'class-validator';
import { TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { Type } from 'class-transformer';
import { CreateSubtaskDto } from './create-subtask.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
    @ApiProperty({
        description: 'The title of the task',
        example: 'Client Meeting - Q1 Review',
        required: true
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'The description of the task',
        example: 'Quarterly review meeting with client to discuss progress and future plans',
        required: true
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'The type of task',
        enum: TaskType,
        example: TaskType.MEETING,
        required: false
    })
    @IsEnum(TaskType)
    @IsOptional()
    taskType?: TaskType;

    @ApiProperty({
        description: 'The priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.HIGH,
        required: false
    })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiProperty({
        description: 'The deadline for the task completion',
        example: '2024-02-28T16:00:00.000Z',
        required: false
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    deadline?: Date;

    @ApiProperty({
        description: 'How often the task should repeat',
        enum: RepetitionType,
        example: RepetitionType.WEEKLY,
        required: false,
        default: RepetitionType.NONE
    })
    @IsEnum(RepetitionType)
    @IsOptional()
    repetitionType?: RepetitionType;

    @ApiProperty({
        description: 'The date until which the task should repeat',
        example: '2024-03-28T16:00:00.000Z',
        required: false
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    repetitionEndDate?: Date;

    @ApiProperty({
        description: 'Array of file attachments for the task',
        example: ['report.pdf', 'presentation.pptx'],
        required: false,
        type: [String]
    })
    @IsArray()
    @IsOptional()
    attachments?: string[];

    @ApiProperty({
        description: 'Array of user IDs assigned to the task',
        example: [1, 2, 3],
        required: false,
        type: [Number]
    })
    @IsArray()
    @IsOptional()
    assigneeIds?: number[];

    @ApiProperty({
        description: 'Array of client IDs associated with the task',
        example: [1, 2],
        required: false,
        type: [Number]
    })
    @IsArray()
    @IsOptional()
    clientIds?: number[];

    @ApiProperty({
        description: 'Array of subtasks',
        type: [CreateSubtaskDto],
        required: false
    })
    @IsArray()
    @IsOptional()
    subtasks?: CreateSubtaskDto[];
}