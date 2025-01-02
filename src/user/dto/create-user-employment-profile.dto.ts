import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsOptional, IsEmail, IsDate, IsEnum, IsObject } from "class-validator";
import { Department } from "../../lib/enums/user.enums";

export class CreateUserEmploymentProfileDto {
    @IsOptional()
    @IsObject()
    @ApiProperty({
        description: 'Branch reference code',
        example: { uid: 1 },
        required: false
    })
    branchref?: { uid: number };

    @IsOptional()
    @IsObject()
    @ApiProperty({
        description: 'User reference code',
        example: { uid: 1 },
        required: false
    })
    owner?: { uid: number };

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Position in the company',
        example: 'Senior Software Engineer',
        required: false
    })
    position?: string;

    @IsOptional()
    @IsEnum(Department)
    @ApiProperty({
        description: 'Department',
        example: Department.ENGINEERING,
        required: false
    })
    department?: Department;

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