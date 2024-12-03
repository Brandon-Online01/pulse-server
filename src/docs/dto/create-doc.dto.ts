import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Title of the document',
        example: 'Document Title'
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Content of the document',
        example: 'Document Content'
    })
    content: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Description of the document',
        example: 'Document Description'
    })
    description?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'File type of the document',
        example: 'pdf'
    })
    fileType: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'File size of the document',
        example: 1024
    })
    fileSize: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'URL of the document',
        example: 'https://example.com/document.pdf'
    })
    url: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Thumbnail URL of the document',
        example: 'https://example.com/thumbnail.jpg'
    })
    thumbnailUrl?: string;

    @IsOptional()
    @IsObject()
    @ApiProperty({
        description: 'Metadata of the document',
        example: { key: 'value' }
    })
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Is public of the document',
        example: true
    })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Mime type of the document',
        example: 'application/pdf'
    })
    mimeType?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Extension of the document',
        example: '.pdf'
    })
    extension?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Owner of the document',
        example: 'user_uid'
    })
    owner?: string;

    @IsOptional()
    @IsArray()
    @ApiProperty({
        description: 'Shared with of the document',
        example: ['user_uid']
    })
    sharedWith?: string[];

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Version of the document',
        example: 1
    })
    version?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Is deleted of the document',
        example: false
    })
    isPublic?: boolean;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Created at of the document',
        example: new Date()
    })
    createdAt?: Date;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Updated at of the document',
        example: new Date()
    })
    updatedAt?: Date;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Last accessed at of the document',
        example: new Date()
    })
    lastAccessedAt?: Date;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Created by of the document',
        example: 'user_uid'
    })
    createdBy?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Updated by of the document',
        example: 'user_uid'
    })
    updatedBy?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'File URL of the document',
        example: 'https://example.com/document.pdf'
    })
    fileUrl?: string;
}
