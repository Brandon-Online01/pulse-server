import { Status } from '../../lib/enums/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsOptional, IsString, IsEnum, IsNotEmpty, IsBoolean, IsObject } from 'class-validator';

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'ACME Inc.',
        description: 'The name of the client'
    })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'John Doe',
        description: 'The contact person of the client'
    })
    contactPerson: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'john.doe@loro.co.za',
        description: 'The email of the client'
    })
    email: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: '+27 64 123 4567',
        description: 'The phone number of the client'
    })
    phone: string;

    @IsPhoneNumber()
    @IsOptional()
    @ApiProperty({
        example: '+27 64 123 4567',
        description: 'The alternative phone number of the client'
    })
    alternativePhone?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.loro.co.za',
        description: 'The website of the client'
    })
    website?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.loro.co.za/logo.png',
        description: 'The logo of the client'
    })
    logo?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'This is a description of the client',
        description: 'The description of the client'
    })
    description?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123 Main St, Anytown, USA',
        description: 'The address of the client'
    })
    address: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Johannesburg',
        description: 'The city of the client'
    })
    city?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'South Africa',
        description: 'The country of the client'
    })
    country?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: '1234',
        description: 'The postal code of the client'
    })
    postalCode?: string;

    @IsEnum(Status)
    @IsNotEmpty()
    @ApiProperty({
        example: Status.ACTIVE,
        description: 'The status of the client'
    })
    status: Status;


    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        example: false,
        description: 'Whether the client is deleted'
    })
    isDeleted: boolean;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '1234567890',
        description: 'The reference code of the client'
    })
    ref: string;

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The assigned sales rep of the client'
    })
    assignedSalesRep: { uid: number };
}
