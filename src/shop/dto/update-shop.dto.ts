import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsNotEmpty, IsString, IsEnum, IsObject } from 'class-validator';
import { ProductStatus } from 'src/lib/enums/enums';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsNumber()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    image: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    salePrice: number;

    @IsNumber()
    @IsNotEmpty()
    discount: number;

    @IsNumber()
    @IsNotEmpty()
    barcode: number;

    @IsNumber()
    @IsNotEmpty()
    packageQuantity: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNumber()
    @IsNotEmpty()
    weight: number;

    @IsEnum(ProductStatus)
    @IsNotEmpty()
    status: ProductStatus;

    @IsObject()
    @IsNotEmpty()
    reseller: { uid: number };
}