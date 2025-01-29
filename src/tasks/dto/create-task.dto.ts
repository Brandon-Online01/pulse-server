import { IsString, IsOptional, IsEnum, IsArray, IsDate, IsNotEmpty, IsBoolean } from 'class-validator';
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
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'The description of the task',
        example: 'Quarterly review meeting with client to discuss progress and future plans',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'The type of task',
        enum: TaskType,
        example: TaskType.IN_PERSON_MEETING,
        required: true
    })
    @IsEnum(TaskType)
    @IsNotEmpty()
    taskType: TaskType;

    @ApiProperty({
        description: 'The priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.HIGH,
        required: true
    })
    @IsEnum(TaskPriority)
    @IsNotEmpty()
    priority: TaskPriority;

    @ApiProperty({
        description: 'The deadline for the task completion',
        example: '2024-02-28T16:00:00.000Z',
        required: true
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    deadline: Date;

    @ApiProperty({
        description: 'How often the task should repeat',
        enum: RepetitionType,
        example: RepetitionType.WEEKLY,
        required: true
    })
    @IsEnum(RepetitionType)
    @IsNotEmpty()
    repetitionType: RepetitionType;

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
        description: 'Array of user objects assigned to the task',
        example: [{ uid: 1 }, { uid: 2 }],
        required: true,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                uid: { type: 'number' }
            }
        }
    })
    @IsArray()
    @IsNotEmpty()
    assignees: { uid: number }[];

    @ApiProperty({
        description: 'Client object associated with the task (optional if targetCategory is provided)',
        example: { uid: 1 },
    })
    @IsOptional()
    client?: { uid: number };

    @ApiProperty({
        description: 'Target category for bulk client assignment. If provided, task will be assigned to all clients in this category',
        example: 'premium',
        required: false
    })
    @IsString()
    @IsOptional()
    targetCategory?: string;

    @ApiProperty({
        description: 'Array of subtasks',
        type: [CreateSubtaskDto],
        required: false
    })
    @IsArray()
    @IsOptional()
    subtasks?: CreateSubtaskDto[];
}