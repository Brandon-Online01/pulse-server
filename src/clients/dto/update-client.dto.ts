import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsOptional, IsString, IsBoolean, IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { AddressDto, CreateClientDto } from './create-client.dto';
import { Type } from 'class-transformer';

export class UpdateClientDto extends PartialType(CreateClientDto) {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'ACME Inc.',
		description: 'The name of the client',
	})
	name?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'John Doe',
		description: 'The contact person of the client',
	})
	contactPerson?: string;

	@IsEmail()
	@IsOptional()
	@ApiProperty({
		example: 'john.doe@loro.co.za',
		description: 'The email of the client',
	})
	email?: string;

	@IsPhoneNumber()
	@IsOptional()
	@ApiProperty({
		example: '+27 64 123 4567',
		description: 'The phone number of the client',
	})
	phone?: string;

	@IsPhoneNumber()
	@IsOptional()
	@ApiProperty({
		example: '+27 64 123 4567',
		description: 'The alternative phone number of the client',
	})
	alternativePhone?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'https://www.loro.co.za',
		description: 'The website of the client',
	})
	website?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'https://www.loro.co.za/logo.png',
		description: 'The logo of the client',
	})
	logo?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'This is a description of the client',
		description: 'The description of the client',
	})
	description?: string;

	@ValidateNested()
	@Type(() => AddressDto)
	@IsOptional()
	@ApiProperty({
		description: 'The full address of the client including coordinates',
		type: AddressDto,
	})
	address?: AddressDto;	

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		example: false,
		description: 'Whether the client is deleted',
	})
	isDeleted?: boolean;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '1234567890',
		description: 'The reference code of the client',
	})
	ref?: string;

	@IsObject()
	@IsOptional()
	@ApiProperty({
		example: { uid: 1 },
		description: 'The assigned sales rep of the client',
	})
	assignedSalesRep?: { uid: number };
}
