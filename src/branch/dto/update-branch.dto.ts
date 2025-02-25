import { IsBoolean, IsDate, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';
import { GeneralStatus } from '../../lib/enums/status.enums';

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

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The address of the branch',
		example: {
			streetNumber: '123',
			street: 'Anystreet',
			suburb: 'Anysuburb',
			city: 'Anycity',
			province: 'Anyprovince',
			country: 'Anycountry',
			postalCode: '12345',
		},
	})
	address?: {
		streetNumber: string;
		street: string;
		suburb: string;
		city: string;
		province: string;
		country: string;
		postalCode: string;
	};

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
	@IsDate()
	@ApiProperty({
		description: 'The created date of the branch',
		example: `${new Date()}`,
	})
	createdAt?: Date;

	@IsOptional()
	@IsDate()
	@ApiProperty({
		description: 'The updated date of the branch',
		example: `${new Date()}`,
	})
	updatedAt?: Date;

	@IsOptional()
	@IsObject()
	@ApiProperty({
		description: 'The organisation of the branch',
		example: { uid: 1 },
	})
	organisation?: { uid: number };
}
