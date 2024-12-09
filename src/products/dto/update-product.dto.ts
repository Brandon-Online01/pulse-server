import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The name of the product',
        example: 'Product Name'
    })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The description of the product',
        example: 'Product Description'
    })
    description: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The image of the product',
        example: 'https://example.com/image.jpg'
    })
    image: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The price of the product',
        example: 10.99
    })
    price: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The sale price of the product',
        example: 9.99
    })
    salePrice: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The discount of the product',
        example: 10
    })
    discount: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The barcode of the product',
        example: 1234567890
    })
    barcode: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The package quantity of the product',
        example: 10
    })
    packageQuantity: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The category of the product',
        example: 'Dairy'
    })
    category: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The weight of the product',
        example: 100
    })
    weight: number;

    @IsNotEmpty()
    @ApiProperty({
        description: 'The status of the product',
        example: { uid: 1 }
    })
    reseller: { uid: number };
}
