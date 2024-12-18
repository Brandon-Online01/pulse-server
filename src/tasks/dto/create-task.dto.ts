import { IsString, IsNotEmpty, IsEnum, IsDate, IsObject, IsOptional, IsNumber, IsArray, ValidateNested } from "class-validator";
import { TaskType, RepetitionType, Priority } from "../../lib/enums/task.enums";
import { ApiProperty } from "@nestjs/swagger";
import { GeneralStatus } from "../../lib/enums/status.enums";

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

    @IsEnum(GeneralStatus)
    @ApiProperty({ example: GeneralStatus.ACTIVE, description: 'Status of the task' })
    status: GeneralStatus;

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
