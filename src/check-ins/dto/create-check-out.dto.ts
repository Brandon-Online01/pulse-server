import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCheckOutDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The photo of the check-out',
        example: 'https://example.com/check-out.jpg'
    })
    checkOutTime: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The location of the check-out',
        example: '123456'
    })
    checkOutLocation: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The photo of the check-out',
        example: 'https://example.com/check-out.jpg'
    })
    checkOutPhoto: string;
}