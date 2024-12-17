import { IsString, IsNotEmpty, IsEnum, IsDate, IsObject, IsOptional, IsNumber, IsArray, ValidateNested } from "class-validator";
import { TaskType, Priority, Status, RepetitionType } from "../../lib/enums/enums";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class CreateSubTaskDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Subtask title', description: 'Title of the subtask' })
    title: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'Subtask description', description: 'Description of the subtask' })
    description?: string;

    @IsNumber()
    @ApiProperty({ example: 0, description: 'Order of the subtask' })
    order: number;

    @IsObject()
    @IsOptional()
    @ApiProperty({ example: { uid: 1 }, description: 'Assignee of the subtask' })
    assignee?: { uid: number };
}

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Task comment', description: 'Comment of the task' })
    comment: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'Task notes', description: 'Notes of the task' })
    notes?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Task description', description: 'Description of the task' })
    description: string;

    @IsEnum(Status)
    @ApiProperty({ example: Status.PENDING, description: 'Status of the task' })
    status: Status;

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({ example: { uid: 1 }, description: 'Owner of the task' })
    owner: { uid: number };

    @IsEnum(TaskType)
    @ApiProperty({ example: TaskType.OTHER, description: 'Type of the task' })
    taskType: TaskType;

    @IsDate()
    @IsOptional()
    @ApiProperty({ example: new Date(), description: 'Deadline of the task' })
    deadline?: Date;

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({ example: { uid: 1 }, description: 'Branch of the task' })
    branch: { uid: number };

    @IsEnum(Priority)
    @ApiProperty({ example: Priority.MEDIUM, description: 'Priority of the task' })
    priority: Priority;

    @IsNumber()
    @ApiProperty({ example: 0, description: 'Progress of the task' })
    progress: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSubTaskDto)
    @IsOptional()
    @ApiProperty({
        type: [CreateSubTaskDto],
        description: 'Subtasks of the task'
    })
    subtasks?: CreateSubTaskDto[];

    @IsArray()
    @ApiProperty({ example: [{ uid: 1 }, { uid: 2 }] })
    assignees: { uid: number }[];

    @IsEnum(RepetitionType)
    @IsOptional()
    @ApiProperty({
        example: RepetitionType.DAILY,
        description: 'Type of repetition'
    })
    repetitionType?: RepetitionType;

    @IsDate()
    @IsOptional()
    @ApiProperty({
        example: `${new Date()}`,
        description: 'Date of the last repetition'
    })
    repetitionEndDate?: Date;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'tasklist.pdf',
        description: 'Attachments of the task'
    })
    attachments?: string;
}
