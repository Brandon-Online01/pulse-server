import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateResellerDto } from './create-reseller.dto';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from 'src/clients/dto/create-client.dto';

export class UpdateResellerDto extends PartialType(CreateResellerDto) {
	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'The name of the reseller',
		example: 'ABC Company',
	})
	name?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'The description of the reseller',
		example: 'ABC Company is a reseller of products',
	})
	description?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'The logo of the reseller',
		example: 'https://example.com/logo.png',
	})
	logo?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'The website of the reseller',
		example: 'https://example.com',
	})
	website?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'The contact person of the reseller',
		example: 'John Doe',
	})
	contactPerson?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'The phone of the reseller',
		example: '1234567890',
	})
	phone?: string;

	@IsEmail()
	@IsOptional()
	@ApiProperty({
		description: 'The email of the reseller',
		example: 'john.doe@example.com',
	})
	email?: string;

	@ValidateNested()
	@Type(() => AddressDto)
	@IsOptional()
	@ApiProperty({
		description: 'The full address of the client including coordinates',
		type: AddressDto,
	})
	address?: AddressDto;
}
