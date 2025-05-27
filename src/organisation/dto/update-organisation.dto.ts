import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrganisationDto } from './create-organisation.dto';
import { ValidateNested, IsEnum } from 'class-validator';
import { IsString, IsEmail, IsUrl, IsOptional } from 'class-validator';
import { AddressDto } from '../../clients/dto/create-client.dto';
import { Type } from 'class-transformer';
import { PlatformType } from '../../lib/enums/platform.enums';

export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {
	@IsOptional()
	@IsString()
	@ApiProperty({
		example: 'Acme Inc.',
		description: 'The name of the organisation',
	})
	name?: string;

	@ValidateNested()
	@Type(() => AddressDto)
	@IsOptional()
	@ApiProperty({
		description: 'The full address of the organisation including coordinates',
		type: AddressDto,
	})
	address: AddressDto;

	@IsOptional()
	@IsEmail()
	@ApiProperty({
		example: 'brandon@loro.co.za',
		description: 'The email of the organisation',
	})
	email: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: '123-456-7890',
		description: 'The phone number of the organisation',
	})
	phone?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: 'Brandon Nkawu',
		description: 'The contact person of the organisation',
	})
	contactPerson: string;

	@IsOptional()
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

	@IsOptional()
	@IsEnum(PlatformType)
	@ApiProperty({
		example: PlatformType.ALL,
		description: 'Platform type for the organization (HR, SALES, CRM, or ALL)',
		enum: PlatformType,
	})
	platform?: PlatformType;
}
