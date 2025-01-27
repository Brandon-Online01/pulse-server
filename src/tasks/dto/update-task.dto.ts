import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsDate } from 'class-validator';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { Type } from 'class-transformer';
import { CreateSubtaskDto } from './create-subtask.dto';

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskType)
    @IsOptional()
    taskType?: TaskType;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsNumber()
    @IsOptional()
    progress?: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    deadline?: Date;

    @IsEnum(RepetitionType)
    @IsOptional()
    repetitionType?: RepetitionType;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    repetitionEndDate?: Date;

    @IsArray()
    @IsOptional()
    attachments?: string[];

    @IsNumber()
    @IsOptional()
    branch?: any;

    @IsArray()
    @IsOptional()
    assignees?: any[];

    @IsNumber()
    @IsOptional()
    client?: any;

    @IsArray()
    @IsOptional()
    subtasks?: CreateSubtaskDto[];
}