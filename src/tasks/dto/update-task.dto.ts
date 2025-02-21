import { IsString, IsOptional, IsEnum, IsArray, IsDate, IsNumber, ValidateNested } from 'class-validator';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AssigneeDto, ClientDto, CreatorDto, SubtaskDto } from './create-task.dto';

export class UpdateTaskDto {
    @ApiProperty({
        description: 'The title of the task',
        example: 'Test Task'
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: 'The description of the task',
        example: 'Test description'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The current status of the task',
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS
    })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiProperty({
        description: 'The type of task',
        enum: TaskType,
        example: TaskType.IN_PERSON_MEETING
    })
    @IsEnum(TaskType)
    @IsOptional()
    taskType?: TaskType;

    @ApiProperty({
        description: 'The priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.HIGH
    })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiProperty({
        description: 'The deadline for the task completion',
        example: new Date().toISOString()
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    deadline?: Date;

    @ApiProperty({
        description: 'How often the task should repeat',
        enum: RepetitionType,
        example: RepetitionType.MONTHLY
    })
    @IsEnum(RepetitionType)
    @IsOptional()
    repetitionType?: RepetitionType;

    @ApiProperty({
        description: 'The deadline for task repetition',
        example: new Date().toISOString()
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    repetitionDeadline?: Date;

    @ApiProperty({
        description: 'Task progress percentage',
        example: 50
    })
    @IsNumber()
    @IsOptional()
    progress?: number;

    @ApiProperty({
        description: 'Array of file attachments for the task',
        example: ['https://cdn-icons-png.flaticon.com/512/3607/3607444.png'],
        type: [String]
    })
    @IsArray()
    @IsOptional()
    attachments?: string[];

    @ApiProperty({
        description: 'Array of assignees',
        type: [AssigneeDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AssigneeDto)
    @IsOptional()
    assignees?: AssigneeDto[];

    @ApiProperty({
        description: 'Array of clients',
        type: [ClientDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ClientDto)
    @IsOptional()
    client?: ClientDto[];

    @ApiProperty({
        description: 'Target category for bulk client assignment',
        example: 'enterprise'
    })
    @IsString()
    @IsOptional()
    targetCategory?: string;

    @ApiProperty({
        description: 'Array of subtasks',
        type: [SubtaskDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubtaskDto)
    @IsOptional()
    subtasks?: SubtaskDto[];

    @ApiProperty({
        description: 'Array of creators',
        type: [CreatorDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatorDto)
    @IsOptional()
    creators?: CreatorDto[];

    @ApiProperty({
        description: 'Comments',
        example: 'Just a testing task'
    })
    @IsString()
    @IsOptional()
    comment?: string;
}