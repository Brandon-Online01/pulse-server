import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsDate, IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { TaskType } from '../../lib/enums/enums';

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
}
