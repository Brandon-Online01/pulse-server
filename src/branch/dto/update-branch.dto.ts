import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';
import { GeneralStatus } from '../../lib/enums/status.enums';
import { AddressDto } from '../../clients/dto/create-client.dto';
import { Type } from 'class-transformer';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The name of the branch',
		example: 'Branch 1',
	})
	name?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The email of the branch',
		example: 'branch@example.com',
	})
	email?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The phone number of the branch',
		example: '08033333333',
	})
	phone?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The contact person of the branch',
		example: 'John Doe',
	})
	contactPerson?: string;

	@ValidateNested()
	@Type(() => AddressDto)
	@IsOptional()
	@ApiProperty({
		description: 'The full address of the client including coordinates',
		type: AddressDto,
	})
	address?: AddressDto;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The website of the branch',
		example: 'https://www.branch.com',
	})
	website?: string;

	@IsOptional()
	@IsEnum(GeneralStatus)
	@ApiProperty({
		description: 'The status of the branch',
		example: 'ACTIVE',
	})
	status?: GeneralStatus;

	@IsOptional()
	@IsBoolean()
	@ApiProperty({
		description: 'The deleted status of the branch',
		example: false,
	})
	isDeleted?: boolean;

	@IsOptional()
	@IsObject()
	@ApiProperty({
		description: 'The organisation of the branch',
		example: { uid: 1 },
	})
	organisation?: { uid: number };
}
