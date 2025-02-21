import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganisationAppearanceDto {
    @ApiProperty({ required: false, description: 'Primary brand color' })
    @IsString()
    @IsOptional()
    primaryColor?: string;

    @ApiProperty({ required: false, description: 'Secondary brand color' })
    @IsString()
    @IsOptional()
    secondaryColor?: string;

    @ApiProperty({ required: false, description: 'Organization logo URL' })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ required: false, description: 'Organization favicon URL' })
    @IsString()
    @IsOptional()
    faviconUrl?: string;

    @ApiProperty({ required: false, description: 'Custom CSS properties' })
    @IsObject()
    @IsOptional()
    customCss?: Record<string, any>;
} 