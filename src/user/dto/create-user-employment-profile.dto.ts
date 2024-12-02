import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsOptional, IsEmail, IsDate } from "class-validator";

export class CreateUserEmploymentProfileDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Branch reference code',
        example: 'BRN001',
        required: false
    })
    branchReferenceCode?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Position in the company',
        example: 'Senior Software Engineer',
        required: false
    })
    position?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Department',
        example: 'Engineering & Business Development',
        required: false
    })
    department?: string;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Employment start date',
        example: `${new Date()}`,
        required: false
    })
    startDate?: Date;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Employment end date',
        example: `${new Date()}`,
        required: false
    })
    endDate?: Date;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Whether currently employed',
        example: true,
        default: true
    })
    isCurrentlyEmployed?: boolean;

    @IsOptional()
    @IsEmail()
    @ApiProperty({
        description: 'Work email address',
        example: 'brandon.work@loro.co.za',
        required: false
    })
    email?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Work contact number',
        example: '+27 64 123 4567',
        required: false
    })
    contactNumber?: string;
} 