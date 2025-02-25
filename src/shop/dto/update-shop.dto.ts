import { PartialType } from '@nestjs/swagger';
import { ProductStatus } from '../../lib/enums/product.enums';
import { IsNumber, IsNotEmpty, IsString, IsEnum, IsObject } from 'class-validator';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

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

	@IsString()
	@IsNotEmpty()
	barcode: string;

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
