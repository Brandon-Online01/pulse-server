import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganisationAppearanceDto {
    @ApiProperty({ 
        required: false, 
        description: 'Primary brand color in hexadecimal format - used for main UI elements like headers and buttons',
        example: '#4285F4'
    })
    @IsString()
    @IsOptional()
    primaryColor?: string;

    @ApiProperty({ 
        required: false, 
        description: 'Secondary brand color in hexadecimal format - used for accents and supporting UI elements',
        example: '#34A853'
    })
    @IsString()
    @IsOptional()
    secondaryColor?: string;

    @ApiProperty({ 
        required: false, 
        description: 'Organization logo URL - high resolution image (recommended size: 200x60px, SVG or PNG with transparency)',
        example: 'https://storage.googleapis.com/acmecorp-assets/logo-full.png'
    })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ 
        required: false, 
        description: 'Organization favicon URL - used in browser tabs (recommended size: 32x32px)',
        example: 'https://storage.googleapis.com/acmecorp-assets/favicon.ico'
    })
    @IsString()
    @IsOptional()
    faviconUrl?: string;

    @ApiProperty({ 
        required: false, 
        description: 'Custom CSS properties for advanced theming - these will be applied to the :root element',
        example: { 
            '--primary-color': '#4285F4',
            '--secondary-color': '#34A853',
            '--accent-color': '#EA4335',
            '--text-color': '#202124',
            '--background-color': '#FFFFFF',
            '--border-radius': '4px'
        }
    })
    @IsObject()
    @IsOptional()
    customCss?: Record<string, any>;
} 