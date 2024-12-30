import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCheckInDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The photo of the check-in',
        example: 'https://example.com/check-in.jpg'
    })
    checkInTime: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The location of the check-in',
        example: '123456'
    })
    checkInPhoto: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The photo of the check-out',
        example: 'https://example.com/check-out.jpg'
    })
    checkInLocation: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: {
            uid: 123456
        },
        description: 'The reference of the user',
    })
    owner: {
        uid: number;
    };
}