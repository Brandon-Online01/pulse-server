import { IsString, IsNotEmpty, IsEmail, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from 'src/clients/dto/create-client.dto';
import { Type } from 'class-transformer';

export class CreateResellerDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The name of the reseller',
        example: 'ABC Company'
    })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The description of the reseller',
        example: 'ABC Company is a reseller of products'
    })
    description: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The logo of the reseller',
        example: 'https://example.com/logo.png'
    })
    logo: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The website of the reseller',
        example: 'https://example.com'
    })
    website: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The contact person of the reseller',
        example: 'John Doe'
    })
    contactPerson: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The phone of the reseller',
        example: '1234567890'
    })
    phone: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The email of the reseller',
        example: 'john.doe@example.com'
    })
    email: string;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The full address of the client including coordinates',
        type: AddressDto
    })
    address: AddressDto;
}
