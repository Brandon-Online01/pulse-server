import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateOrganisationDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Acme Inc.',
        description: 'The name of the organisation'
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: {
            streetNumber: '123',
            street: 'Anystreet',
            suburb: 'Anysuburb',
            city: 'Anycity',
            province: 'Anyprovince',
            country: 'Anycountry',
            postalCode: '12345'
        },
        description: 'The address of the organisation'
    })
    address: {
        streetNumber: string;
        street: string;
        suburb: string;
        city: string;
        province: string;
    };

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        example: 'brandon@loro.co.za',
        description: 'The email of the organisation'
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '123-456-7890',
        description: 'The phone number of the organisation'
    })
    phone: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Brandon Nkawu',
        description: 'The contact person of the organisation'
    })
    contactPerson: string;

    @IsNotEmpty()
    @IsUrl()
    @ApiProperty({
        example: 'https://www.acme.com',
        description: 'The website of the organisation'
    })
    website: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'https://www.acme.com/logo.png',
        description: 'The logo of the organisation'
    })
    logo: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'ACME123',
        description: 'The reference code of the organisation'
    })
    ref: string;
}
