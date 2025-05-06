import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsArray } from 'class-validator';
import { LeadStatus } from 'src/lib/enums/lead.enums';

export class CreateLeadDto {
	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Full name of the lead',
		example: 'John Doe',
	})
	name?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Company name of the lead',
		example: 'Acme Inc.',
	})
	companyName?: string;

	@IsOptional()
	@IsEmail()
	@ApiProperty({
		description: 'Email of the lead',
		example: 'john.doe@example.com',
	})
	email?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Phone number of the lead',
		example: '+351912345678',
	})
	phone?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Notes of the lead',
		example: 'Some notes about the lead',
	})
	notes?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Image of the lead',
		example: 'https://storage.googleapis.com/bucket/image.jpg',
	})
	image?: string;

	@IsOptional()
	@IsNumber()
	@ApiProperty({
		description: 'Latitude coordinate of the lead',
		example: -33.9249,
	})
	latitude?: number;

	@IsOptional()
	@IsNumber()
	@ApiProperty({
		description: 'Longitude coordinate of the lead',
		example: 18.4241,
	})
	longitude?: number;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Status of the lead',
		example: LeadStatus.PENDING,
	})
	status?: LeadStatus;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Is deleted of the lead',
		example: false,
	})
	isDeleted?: boolean;

	@IsNotEmpty()
	@IsObject()
	@ApiProperty({
		description: 'The owner reference code of the lead',
		example: { uid: 1 },
	})
	owner: { uid: number };

	@IsNotEmpty()
	@IsObject()
	@ApiProperty({
		example: { uid: 1 },
		description: 'The branch reference code of the lead',
	})
	branch: { uid: number };

	@IsOptional()
	@IsArray()
	@ApiProperty({
		description: 'List of user IDs assigned to this lead',
		example: [{ uid: 1 }, { uid: 2 }],
		required: false,
	})
	assignees?: { uid: number }[];
}
