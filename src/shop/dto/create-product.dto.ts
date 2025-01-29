import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ProductStatus } from '../../lib/enums/product.enums';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The name of the product',
        example: 'Product Name'
    })
    name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The description of the product',
        example: 'Product Description'
    })
    description?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The price of the product',
        example: 10.99
    })
    price?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The category of the product',
        example: 'Electronics'
    })
    category?: string;

    @IsEnum(ProductStatus)
    @IsOptional()
    @ApiProperty({
        description: 'The status of the product',
        enum: ProductStatus,
        default: ProductStatus.NEW
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
        description: 'The SKU of the product',
        example: 'ELE-PRO-001-000001'
    })
    sku?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The warehouse location of the product',
        example: 'A1-B2-C3'
    })
    warehouseLocation?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The current stock quantity',
        example: 100
    })
    stockQuantity?: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The product reference code',
        example: 'REF-001'
    })
    productReferenceCode: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The reorder point for stock management',
        example: 10,
        default: 10
    })
    reorderPoint?: number;

    @IsNotEmpty()
    @ApiProperty({
        description: 'The reseller associated with the product',
        example: { uid: 1 }
    })
    reseller: { uid: number };
}
