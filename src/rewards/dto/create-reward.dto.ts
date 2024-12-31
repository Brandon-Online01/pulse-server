import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 1,
        description: 'User ID'
    })
    owner: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'CREATE_TASK',
        description: 'Action type'
    })
    action: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 50,
        description: 'XP amount'
    })
    amount: number;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: {
            id: '123',
            type: 'task',
            details: {}
        },
        description: 'Source information'
    })
    source: {
        id: string;
        type: string;
        details?: any;
    };
}
