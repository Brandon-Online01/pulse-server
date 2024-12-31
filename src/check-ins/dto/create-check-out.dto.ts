import { IsNotEmpty, IsObject, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCheckOutDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The photo of the check-out',
        example: `${new Date()}`
    })
    checkOutTime: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The location of the check-out',
        example: '-36.3434314, 149.8488864'
    })
    checkOutLocation: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The saved check out photo tag name i.e check-out.jpg',
        example: 'check-out.jpg'
    })
    checkOutPhoto: string;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'The reference of the check-in',
        example: {
            uid: 1
        }
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