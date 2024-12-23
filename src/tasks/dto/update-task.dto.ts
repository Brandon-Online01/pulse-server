import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsDate, IsEnum, IsNotEmpty, IsObject, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { TaskType } from '../../lib/enums/task.enums';
import { CreateSubtaskDto } from './create-subtask.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
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
        example: `${new Date()}`,
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

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @ApiProperty({
        example: CreateSubtaskDto,
        description: 'Subtasks of the task',
        type: [CreateSubtaskDto]
    })
    subtasks?: CreateSubtaskDto[];
}