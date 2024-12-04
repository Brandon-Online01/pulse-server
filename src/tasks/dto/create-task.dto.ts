import { IsString, IsNotEmpty, IsEnum, IsDate, IsObject } from "class-validator";
import { TaskType } from "../../lib/enums/enums";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'This is a task comment',
        description: 'The comment of the task'
    })
    comment: string;

    @IsString()
    @ApiProperty({
        example: 'This is a task note',
        description: 'The notes of the task'
    })
    notes: string;

    @IsString()
    @ApiProperty({
        example: 'Acme Inc.',
        description: 'The client of the task'
    })
    client: string;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The owner of the task'
    })
    owner: { uid: number };

    @IsEnum(TaskType)
    @ApiProperty({
        example: TaskType.OTHER,
        description: 'The type of the task'
    })
    taskType: TaskType;

    @IsDate()
    @ApiProperty({
        example: new Date(),
        description: 'The deadline of the task'
    })
    deadline: Date;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the task'
    })
    branch: { uid: number };
}
