import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Status } from "../../lib/enums/enums";

export class CreateLeadDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Full name of the lead',
        example: 'John Doe',
    })
    name: string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        description: 'Email of the lead',
        example: 'john.doe@example.com',
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Phone number of the lead',
        example: '+351912345678',
    })
    phone: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Notes of the lead',
        example: 'Some notes about the lead',
    })
    notes: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Status of the lead',
        example: Status.PENDING,
    })
    status: Status;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Is deleted of the lead',
        example: false,
    })
    isDeleted: boolean;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'The owner reference code of the lead',
        example: { uid: 1 },
    })
    owner: { uid: number };

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the lead'
    })
    branch: { uid: number };
}
