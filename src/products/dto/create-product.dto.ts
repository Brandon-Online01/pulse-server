import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class CreateProductDto {
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

    @IsDate()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The sale start date of the product',
        example: '2024-01-01'
    })
    saleStart: Date;

    @IsDate()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The sale end date of the product',
        example: '2024-01-01'
    })
    saleEnd: Date;

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

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The sub category of the product',
        example: 'Milk'
    })
    subCategory: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The brand of the product',
        example: 'Brand Name'
    })
    brand: string;

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
