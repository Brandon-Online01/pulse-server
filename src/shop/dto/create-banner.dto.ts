import { IsEnum, IsNotEmpty, IsString } from "class-validator";
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
} 