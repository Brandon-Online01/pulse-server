import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsDate, IsBoolean } from 'class-validator';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { Type } from 'class-transformer';
import { CreateSubtaskDto } from './create-subtask.dto';

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

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
    branchId?: number;

    @IsArray()
    @IsOptional()
    assigneeIds?: number[];

    @IsArray()
    @IsOptional()
    clientIds?: number[];

    @IsArray()
    @IsOptional()
    subtasks?: CreateSubtaskDto[];

    @IsBoolean()
    @IsOptional()
    isDeleted?: boolean;
}