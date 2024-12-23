import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSubtaskDto } from './create-subtask.dto';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { SubTaskStatus } from '../../lib/enums/status.enums';

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Attendance & Dress Code',
        description: 'Title of the subtask'
    })
    title?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Check employee attendance and dress code',
        description: 'Description of the subtask'
    })
    description?: string;

    @IsEnum(SubTaskStatus)
    @ApiProperty({
        example: SubTaskStatus.PENDING,
        description: 'Status of the subtask'
    })
    status: SubTaskStatus;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: false,
        description: 'Is the subtask deleted'
    })
    isDeleted?: boolean;
} 