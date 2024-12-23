import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSubtaskDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Attendance & Dress Code',
        description: 'Title of the subtask'
    })
    title: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Check employee attendance and dress code',
        description: 'Description of the subtask'
    })
    description?: string;
} 