import { IsString, IsOptional, IsObject, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    phone?: {
        code: string;
        number: string;
    };

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    website?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;
}

export class RegionalDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    language?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    timezone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    dateFormat?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    timeFormat?: string;
}

export class BrandingDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    logoAltText?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    favicon?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    primaryColor?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    secondaryColor?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    accentColor?: string;
}

export class BusinessDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    registrationNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    taxId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    industry?: string;

    @ApiProperty({ required: false, enum: ['small', 'medium', 'large', 'enterprise'] })
    @IsEnum(['small', 'medium', 'large', 'enterprise'])
    @IsOptional()
    size?: 'small' | 'medium' | 'large' | 'enterprise';
}

export class NotificationsDto {
    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    email?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    sms?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    push?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    whatsapp?: boolean;
}

export class PreferencesDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    defaultView?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    itemsPerPage?: number;

    @ApiProperty({ required: false, enum: ['light', 'dark', 'system'] })
    @IsEnum(['light', 'dark', 'system'])
    @IsOptional()
    theme?: 'light' | 'dark' | 'system';

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    menuCollapsed?: boolean;
}

export class CreateOrganisationSettingsDto {
    @ApiProperty({ type: ContactDto, required: false })
    @IsObject()
    @IsOptional()
    contact?: ContactDto;

    @ApiProperty({ type: RegionalDto, required: false })
    @IsObject()
    @IsOptional()
    regional?: RegionalDto;

    @ApiProperty({ type: BrandingDto, required: false })
    @IsObject()
    @IsOptional()
    branding?: BrandingDto;

    @ApiProperty({ type: BusinessDto, required: false })
    @IsObject()
    @IsOptional()
    business?: BusinessDto;

    @ApiProperty({ type: NotificationsDto, required: false })
    @IsObject()
    @IsOptional()
    notifications?: NotificationsDto;

    @ApiProperty({ type: PreferencesDto, required: false })
    @IsObject()
    @IsOptional()
    preferences?: PreferencesDto;
} 