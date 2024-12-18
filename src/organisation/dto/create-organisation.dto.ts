import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { GeneralStatus } from "../../lib/enums/status.enums";

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
        example: '123 Main St, Anytown, USA',
        description: 'The address of the organisation'
    })
    address: string;

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
    @IsEnum(GeneralStatus)
    @ApiProperty({
        example: GeneralStatus.ACTIVE,
        description: 'The status of the organisation'
    })
    status: GeneralStatus;

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({
        example: false,
        description: 'Whether the organisation is deleted'
    })
    isDeleted: boolean;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'ACME123',
        description: 'The reference code of the organisation'
    })
    ref: string;
}
