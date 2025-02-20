import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../../lib/enums/product.enums';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDate } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The name of the product',
        example: 'Product Name'
    })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The description of the product',
        example: 'Product Description'
    })
    description?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The category of the product',
        example: 'MEAT_POULTRY'
    })
    category?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The price of the product',
        example: 1230
    })
    price?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The sale price of the product',
        example: 110
    })
    salePrice?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The discount percentage',
        example: 10
    })
    discount?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The barcode of the product',
        example: '123213213'
    })
    barcode?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The package quantity',
        example: 20
    })
    packageQuantity?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The brand of the product',
        example: 'Brand Name'
    })
    brand?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The weight of the product',
        example: 10
    })
    weight?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The stock quantity',
        example: 110
    })
    stockQuantity?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The SKU of the product',
        example: '09BCL44P09011'
    })
    sku?: string;

    @IsEnum(ProductStatus)
    @IsOptional()
    @ApiProperty({
        description: 'The status of the product',
        enum: ProductStatus
    })
    status?: ProductStatus;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The URL of the product image',
        example: 'https://example.com/image.jpg'
    })
    imageUrl?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The warehouse location of the product',
        example: '123123'
    })
    warehouseLocation?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The product reference code',
        example: 'redfe332'
    })
    productReferenceCode?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The reorder point for stock management',
        example: 10
    })
    reorderPoint?: number;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Whether the product is on promotion',
        example: false
    })
    isOnPromotion?: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Additional package details',
        example: 'extra'
    })
    packageDetails?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The product reference',
        example: 'redfe332'
    })
    productRef?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Whether the product is deleted',
        example: false
    })
    isDeleted?: boolean;

    @IsDate()
    @IsOptional()
    @ApiProperty({
        description: 'The promotion start date',
        example: null
    })
    promotionStartDate?: Date;

    @IsDate()
    @IsOptional()
    @ApiProperty({
        description: 'The promotion end date',
        example: null
    })
    promotionEndDate?: Date;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The package unit',
        example: 'unit'
    })
    packageUnit?: string;
}