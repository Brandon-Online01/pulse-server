import { IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCheckInDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The photo of the check-in',
        example: `${new Date()}`
    })
    checkInTime: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The saved check in photo tag name i.e check-in.jpg',
        example: 'check-in.jpg'
    })
    checkInPhoto: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The location of the check-in',
        example: '-36.3434314, 149.8488864'
    })
    checkInLocation: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: {
            uid: 1
        },
        description: 'The reference of the user',
    })
    owner: {
        uid: number;
    };

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: {
            uid: 1
        },
        description: 'The branch reference code of the attendance check in'
    })
    branch: { uid: number };
}
