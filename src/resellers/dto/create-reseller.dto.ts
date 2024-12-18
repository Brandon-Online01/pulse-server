import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResellerStatus } from '../../lib/enums/product.enums';

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
    @IsNotEmpty()
    @ApiProperty({
        description: 'The logo of the reseller',
        example: 'https://example.com/logo.png'
    })
    logo: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The website of the reseller',
        example: 'https://example.com'
    })
    website: string;

    @IsEnum(ResellerStatus)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The status of the reseller',
        example: 'ACTIVE'
    })
    status: ResellerStatus;

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

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The address of the reseller',
        example: '123 Main Street, Anytown, USA'
    })
    address: string;
}
