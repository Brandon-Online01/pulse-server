import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSubtaskDto } from './create-subtask.dto';
import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsDate } from 'class-validator';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';

export class UpdateTaskDto {
    @ApiProperty({
        description: 'The title of the task',
        example: 'Client Meeting - Q1 Review (Updated)',
        required: false
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: 'The description of the task',
        example: 'Updated quarterly review meeting details and agenda',
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The current status of the task',
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS,
        required: false
    })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

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
        required: false
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
        example: ['updated-report.pdf', 'final-presentation.pptx'],
        required: false,
        type: [String]
    })
    @IsArray()
    @IsOptional()
    attachments?: string[];

    @ApiProperty({
        description: 'Array of user objects assigned to the task',
        example: [{ uid: 1 }, { uid: 2 }],
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                uid: { type: 'number' }
            }
        }
    })
    @IsArray()
    @IsOptional()
    assignees?: any[];

    @ApiProperty({
        description: 'Array of client objects associated with the task',
        example: [{ uid: 1 }, { uid: 2 }],
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                uid: { type: 'number' }
            }
        }
    })
    @IsArray()
    @IsOptional()
    clients?: any[];

    @ApiProperty({
        description: 'Array of subtasks',
        type: [CreateSubtaskDto],
        required: false
    })
    @IsArray()
    @IsOptional()
    subtasks?: CreateSubtaskDto[];
}