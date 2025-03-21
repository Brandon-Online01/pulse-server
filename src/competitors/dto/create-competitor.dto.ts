import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsEnum,
	IsBoolean,
	IsNumber,
	IsUrl,
	IsEmail,
	IsDate,
	IsArray,
	ValidateNested,
	IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from 'src/clients/dto/create-client.dto';
import { CompetitorStatus, CompetitorType } from '../../lib/enums/competitor.enums';

class SocialMediaDto {
	@IsString()
	@IsOptional()
	@IsUrl()
	@ApiProperty({
		description: 'LinkedIn profile URL',
		example: 'https://linkedin.com/company/competitor-name',
		required: false,
	})
	linkedin?: string;

	@IsString()
	@IsOptional()
	@IsUrl()
	@ApiProperty({
		description: 'Twitter profile URL',
		example: 'https://twitter.com/competitor_name',
		required: false,
	})
	twitter?: string;

	@IsString()
	@IsOptional()
	@IsUrl()
	@ApiProperty({
		description: 'Facebook page URL',
		example: 'https://facebook.com/competitorname',
		required: false,
	})
	facebook?: string;

	@IsString()
	@IsOptional()
	@IsUrl()
	@ApiProperty({
		description: 'Instagram profile URL',
		example: 'https://instagram.com/competitor_name',
		required: false,
	})
	instagram?: string;
}

class PricingDataDto {
	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Low-end pricing',
		example: 99.99,
		required: false,
	})
	lowEndPricing?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Mid-range pricing',
		example: 299.99,
		required: false,
	})
	midRangePricing?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'High-end pricing',
		example: 999.99,
		required: false,
	})
	highEndPricing?: number;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'Pricing model',
		example: 'subscription',
		required: false,
	})
	pricingModel?: string;
}

export class CreateCompetitorDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'The name of the competitor',
		example: 'Competitor Inc.',
	})
	name: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'Description of the competitor company',
		example: 'A major competitor in the enterprise software space',
		required: false,
	})
	description?: string;

	@IsString()
	@IsOptional()
	@IsUrl()
	@ApiProperty({
		description: 'Competitor website URL',
		example: 'https://competitor.com',
		required: false,
	})
	website?: string;

	@IsString()
	@IsOptional()
	@IsEmail()
	@ApiProperty({
		description: 'Contact email address',
		example: 'contact@competitor.com',
		required: false,
	})
	contactEmail?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'Contact phone number',
		example: '+1-123-456-7890',
		required: false,
	})
	contactPhone?: string;

	@ValidateNested()
	@Type(() => AddressDto)
	@IsNotEmpty()
	@ApiProperty({
		description: 'The full address of the client including coordinates',
		type: AddressDto,
	})
	address: AddressDto;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: "URL to competitor's logo",
		example: 'https://competitor.com/logo.png',
		required: false,
	})
	logoUrl?: string;

	@IsEnum(CompetitorStatus)
	@IsOptional()
	@ApiProperty({
		description: 'Status of the competitor',
		enum: CompetitorStatus,
		example: CompetitorStatus.ACTIVE,
		required: false,
	})
	status?: CompetitorStatus;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Estimated market share percentage',
		example: 12.5,
		required: false,
	})
	marketSharePercentage?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Estimated annual revenue in USD',
		example: 10000000,
		required: false,
	})
	estimatedAnnualRevenue?: number;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'Industry',
		example: 'Software',
		required: false,
	})
	industry?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	@ApiProperty({
		description: 'Key products or services',
		example: ['CRM Software', 'Marketing Automation', 'Support Solutions'],
		isArray: true,
		required: false,
	})
	keyProducts?: string[];

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	@ApiProperty({
		description: 'Key strengths',
		example: ['Strong brand recognition', 'Excellent customer support', 'Robust feature set'],
		isArray: true,
		required: false,
	})
	keyStrengths?: string[];

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	@ApiProperty({
		description: 'Key weaknesses',
		example: ['High pricing', 'Complex user interface', 'Poor mobile support'],
		isArray: true,
		required: false,
	})
	keyWeaknesses?: string[];

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Estimated number of employees',
		example: 5000,
		required: false,
	})
	estimatedEmployeeCount?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Threat level (1-5)',
		example: 4,
		required: false,
		minimum: 1,
		maximum: 5,
	})
	threatLevel?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Competitive advantage level (1-5)',
		example: 3,
		required: false,
		minimum: 1,
		maximum: 5,
	})
	competitiveAdvantage?: number;

	@IsObject()
	@ValidateNested()
	@Type(() => PricingDataDto)
	@IsOptional()
	@ApiProperty({
		description: 'Pricing data and models',
		type: PricingDataDto,
		required: false,
	})
	pricingData?: PricingDataDto;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'Business strategy analysis',
		example: 'Focused on enterprise clients with high-touch sales approach',
		required: false,
	})
	businessStrategy?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'Marketing strategy analysis',
		example: 'Heavy investment in content marketing and industry events',
		required: false,
	})
	marketingStrategy?: string;

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		description: 'Whether this is a direct competitor',
		example: true,
		required: false,
	})
	isDirect?: boolean;

	@IsDate()
	@IsOptional()
	@ApiProperty({
		description: 'Date when company was founded',
		example: '2010-01-01',
		required: false,
	})
	foundedDate?: Date;

	@IsObject()
	@ValidateNested()
	@Type(() => SocialMediaDto)
	@IsOptional()
	@ApiProperty({
		description: 'Social media profiles',
		type: SocialMediaDto,
		required: false,
	})
	socialMedia?: SocialMediaDto;

	@IsEnum(CompetitorType)
	@IsOptional()
	@ApiProperty({
		description: 'Type of competitor',
		enum: CompetitorType,
		example: CompetitorType.DIRECT,
		required: false,
	})
	competitorType?: CompetitorType;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Organisation ID this competitor belongs to',
		example: 1,
		required: false,
	})
	organisationId?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'Branch ID this competitor belongs to',
		example: 1,
		required: false,
	})
	branchId?: number;
}
