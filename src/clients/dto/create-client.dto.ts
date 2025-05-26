import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsOptional, IsString, IsNotEmpty, IsObject, ValidateNested, IsEnum, IsNumber, IsDate, IsArray, IsDecimal, Min, Max, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientContactPreference, PriceTier, AcquisitionChannel, ClientRiskLevel, PaymentMethod, GeofenceType } from '../../lib/enums/client.enums';
import { CreateCommunicationScheduleDto } from './communication-schedule.dto';

export class AddressDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123 Main St',
        description: 'Street address including house/building number'
    })
    street: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Halfway House',
        description: 'Suburb name'
    })
    suburb: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Cape Town',
        description: 'City name'
    })
    city: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Western Cape',
        description: 'State or province name'
    })
    state: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'South Africa',
        description: 'Country name'
    })
    country: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '8001',
        description: 'Postal/ZIP code'
    })
    postalCode: string;
}

export class SocialProfilesDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.linkedin.com/company/acme',
        description: 'LinkedIn profile URL'
    })
    linkedin?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://twitter.com/acme',
        description: 'Twitter/X profile URL'
    })
    twitter?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.facebook.com/acme',
        description: 'Facebook page URL'
    })
    facebook?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.instagram.com/acme',
        description: 'Instagram profile URL'
    })
    instagram?: string;
}

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'ACME Inc.',
        description: 'The name of the client'
    })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'John Doe',
        description: 'The contact person of the client'
    })
    contactPerson: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'john.doe@example.co.za',
        description: 'The email of the client'
    })
    email: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: '+27 64 123 4567',
        description: 'The phone number of the client'
    })
    phone: string;

    @IsPhoneNumber()
    @IsOptional()
    @ApiProperty({
        example: '+27 64 987 6543',
        description: 'The alternative phone number of the client',
        required: false
    })
    alternativePhone?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.acme.co.za',
        description: 'The website of the client',
        required: false
    })
    website?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.acme.co.za/logo.png',
        description: 'The URL to the client logo image',
        required: false
    })
    logo?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'ACME Inc. is a leading provider of innovative solutions in South Africa.',
        description: 'The description of the client and their business',
        required: false
    })
    description?: string;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The full address of the client including coordinates',
        type: AddressDto
    })
    address: AddressDto;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'contract',
        description: 'The category of the client',
        required: false
    })
    category?: string;
    
    @IsObject()
    @IsOptional()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The assigned sales representative of the client'
    })
    assignedSalesRep: { uid: number };

    // CRM enhancements

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 50000,
        description: 'Credit limit for the client',
        required: false
    })
    creditLimit?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 5000,
        description: 'Current outstanding balance',
        required: false
    })
    outstandingBalance?: number;

    @IsEnum(PriceTier)
    @IsOptional()
    @ApiProperty({
        enum: PriceTier,
        example: PriceTier.STANDARD,
        description: 'The price tier that determines pricing structure for this client',
        required: false
    })
    priceTier?: PriceTier;

    @IsEnum(ClientContactPreference)
    @IsOptional()
    @ApiProperty({
        enum: ClientContactPreference,
        example: ClientContactPreference.EMAIL,
        description: 'The preferred method of communication',
        required: false
    })
    preferredContactMethod?: ClientContactPreference;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        example: '2023-12-15T10:30:00Z',
        description: 'The date of the last visit or interaction',
        required: false
    })
    lastVisitDate?: Date;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        example: '2024-03-15T14:00:00Z',
        description: 'The date of the next scheduled contact',
        required: false
    })
    nextContactDate?: Date;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiProperty({
        example: ['Electronics', 'Software', 'Services'],
        description: 'Store/Product categories this client can access',
        required: false
    })
    visibleCategories?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiProperty({
        example: ['VIP', 'Regular', 'Bulk Buyer'],
        description: 'Tags for better client categorization',
        required: false
    })
    tags?: string[];

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        example: '1985-05-15',
        description: 'Client birthday for sending special offers',
        required: false
    })
    birthday?: Date;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        example: '2020-01-10',
        description: 'Anniversary date (when the client relationship began)',
        required: false
    })
    anniversaryDate?: Date;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 250000,
        description: 'Lifetime value of the client',
        required: false
    })
    lifetimeValue?: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    @ApiProperty({
        example: 10,
        description: 'Discount percentage (if client has a specific discount)',
        required: false
    })
    discountPercentage?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Net 30',
        description: 'Payment terms for this client',
        required: false
    })
    paymentTerms?: string;

    @IsEnum(AcquisitionChannel)
    @IsOptional()
    @ApiProperty({
        enum: AcquisitionChannel,
        example: AcquisitionChannel.REFERRAL,
        description: 'How the client was acquired',
        required: false
    })
    acquisitionChannel?: AcquisitionChannel;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        example: '2023-01-15',
        description: 'The date when the client was acquired',
        required: false
    })
    acquisitionDate?: Date;

    @IsEnum(ClientRiskLevel)
    @IsOptional()
    @ApiProperty({
        enum: ClientRiskLevel,
        example: ClientRiskLevel.LOW,
        description: 'Risk assessment level for this client',
        required: false
    })
    riskLevel?: ClientRiskLevel;

    @IsEnum(PaymentMethod)
    @IsOptional()
    @ApiProperty({
        enum: PaymentMethod,
        example: PaymentMethod.BANK_TRANSFER,
        description: 'Client\'s preferred payment method',
        required: false
    })
    preferredPaymentMethod?: PaymentMethod;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'English',
        description: 'Client\'s preferred language for communication',
        required: false
    })
    preferredLanguage?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Technology',
        description: 'The industry sector of the client',
        required: false
    })
    industry?: string;

    @IsInt()
    @IsOptional()
    @ApiProperty({
        example: 250,
        description: 'Number of employees in the client\'s company',
        required: false
    })
    companySize?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 5000000,
        description: 'Annual revenue of the client',
        required: false
    })
    annualRevenue?: number;

    @IsNumber()
    @Min(0)
    @Max(10)
    @IsOptional()
    @ApiProperty({
        example: 9.5,
        description: 'Customer satisfaction score (0-10)',
        required: false
    })
    satisfactionScore?: number;

    @IsInt()
    @Min(-10)
    @Max(10)
    @IsOptional()
    @ApiProperty({
        example: 8,
        description: 'Net Promoter Score (-10 to 10)',
        required: false
    })
    npsScore?: number;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        example: { preferredBrand: 'Sony', previousSupplier: 'Samsung' },
        description: 'Custom fields specific to this client',
        required: false
    })
    customFields?: Record<string, any>;

    @ValidateNested()
    @Type(() => SocialProfilesDto)
    @IsOptional()
    @ApiProperty({
        type: SocialProfilesDto,
        description: 'Social media profiles of the client',
        required: false
    })
    socialProfiles?: SocialProfilesDto;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 51.5074,
        description: 'Latitude coordinate',
        required: false
    })
    latitude?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: -0.1278,
        description: 'Longitude coordinate',
        required: false
    })
    longitude?: number;

    @IsEnum(GeofenceType)
    @IsOptional()
    @ApiProperty({
        enum: GeofenceType,
        example: GeofenceType.NOTIFY,
        description: 'Geofence type to apply for this client',
        required: false
    })
    geofenceType?: GeofenceType;

    @IsNumber()
    @IsOptional()
    @Min(100)
    @Max(5000)
    @ApiProperty({
        example: 500,
        description: 'Radius in meters for geofence (default: 500)',
        required: false,
        minimum: 100,
        maximum: 5000
    })
    geofenceRadius?: number;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: true,
        description: 'Enable geofencing for this client',
        required: false,
        default: false
    })
    enableGeofence?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCommunicationScheduleDto)
    @IsOptional()
    @ApiProperty({
        type: [CreateCommunicationScheduleDto],
        description: 'Communication schedules to set up for this client',
        required: false
    })
    communicationSchedules?: CreateCommunicationScheduleDto[];
}
