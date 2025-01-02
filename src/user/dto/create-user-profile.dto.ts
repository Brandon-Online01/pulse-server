import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "../../lib/enums/gender.enums";
import { IsString, IsOptional, IsEnum, IsDate } from "class-validator";

export class CreateUserProfileDto {
    @IsString()
    @ApiProperty({
        description: 'User reference code',
        example: { uid: 1 },
    })
    owner: { uid: number };

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Height',
        example: '180cm',
        required: false
    })
    height?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Weight',
        example: '75kg',
        required: false
    })
    weight?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Hair color',
        example: 'Brown',
        required: false
    })
    hairColor?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Eye color',
        example: 'Blue',
        required: false
    })
    eyeColor?: string;

    @IsOptional()
    @IsEnum(Gender)
    @ApiProperty({
        description: 'Gender',
        enum: Gender,
        example: Gender.MALE,
        required: false
    })
    gender?: Gender;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Date of birth',
        example: `${new Date()}`,
        required: false
    })
    dateOfBirth?: Date;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Address',
        example: '123 Main Street',
        required: false
    })
    address?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'City',
        example: 'Cape Town',
        required: false
    })
    city?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Country',
        example: 'South Africa',
        required: false
    })
    country?: string;
} 