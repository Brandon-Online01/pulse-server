import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { AddressDto } from '../../clients/dto/create-client.dto';

export class CreateOrganisationDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		example: 'Acme Inc.',
		description: 'The name of the organisation',
	})
	name: string;

	@ValidateNested()
	@Type(() => AddressDto)
	@IsNotEmpty()
	@ApiProperty({
		description: 'The full address of the client including coordinates',
		type: AddressDto,
	})
	address: AddressDto;

	@IsNotEmpty()
	@IsEmail()
	@ApiProperty({
		example: 'brandon@loro.co.za',
		description: 'The email of the organisation',
	})
	email: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		example: '123-456-7890',
		description: 'The phone number of the organisation',
	})
	phone: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		example: 'Brandon Nkawu',
		description: 'The contact person of the organisation',
	})
	contactPerson: string;

	@IsNotEmpty()
	@IsUrl()
	@ApiProperty({
		example: 'https://www.acme.com',
		description: 'The website of the organisation',
	})
	website: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: 'https://www.acme.com/logo.png',
		description: 'The logo of the organisation',
	})
	logo?: string;
}
