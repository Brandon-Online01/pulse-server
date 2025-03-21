import { IsBoolean, IsEnum, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BannerCategory } from "src/lib/enums/category.enum";

export class CreateBannerDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        title: 'title',
        description: 'title of the banner',
        example: 'New'
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        title: 'subtitle',
        description: 'subtitle of the banner',
        example: 'Rewards'
    })
    subtitle: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        title: 'description',
        description: 'description of the banner',
        example: 'new rewards program!'
    })
    description: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        title: 'image',
        description: 'image of the banner',
        example: 'https://www.google.com/image.png'
    })
    image: string;

    @IsNotEmpty()
    @IsEnum(BannerCategory)
    @ApiProperty({
        title: 'category',
        description: 'category of the banner',
        enum: BannerCategory,
        example: BannerCategory.NEWS
    })
    category: BannerCategory;

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({
        description: 'Deletion status of the banner',
        example: false
    })
    isDeleted: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Content or message of the banner',
        example: 'Get up to 50% off on all summer items'
    })
    content: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Image URL for the banner',
        required: false,
        example: 'https://example.com/images/summer-sale.jpg'
    })
    imageUrl?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Link URL when banner is clicked',
        required: false,
        example: 'https://example.com/sale/summer'
    })
    linkUrl?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Whether the banner is active',
        required: false,
        default: true,
        example: true
    })
    isActive?: boolean;
} 