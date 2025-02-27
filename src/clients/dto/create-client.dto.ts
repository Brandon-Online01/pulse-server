import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsOptional, IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123 Main St',
        description: 'Street address including house/building number'
    })
    street: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Cape Town',
        description: 'City name'
    })
    city: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Western Cape',
        description: 'State or province name'
    })
    state: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'South Africa',
        description: 'Country name'
    })
    country: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '8001',
        description: 'Postal/ZIP code'
    })
    postalCode: string;
}

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
        example: 'john.doe@example.co.za',
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
        example: '+27 64 987 6543',
        description: 'The alternative phone number of the client',
        required: false
    })
    alternativePhone?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.acme.co.za',
        description: 'The website of the client',
        required: false
    })
    website?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.acme.co.za/logo.png',
        description: 'The URL to the client logo image',
        required: false
    })
    logo?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'ACME Inc. is a leading provider of innovative solutions in South Africa.',
        description: 'The description of the client and their business',
        required: false
    })
    description?: string;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The full address of the client including coordinates',
        type: AddressDto
    })
    address: AddressDto;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'contract',
        description: 'The category of the client',
        required: false
    })
    category?: string;
    
    @IsObject()
    @IsOptional()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The assigned sales representative of the client'
    })
    assignedSalesRep: { uid: number };
}
