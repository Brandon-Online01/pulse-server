import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({
		description: 'The product ID',
		example: 39,
	})
	uid: number;

	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Quantity of the product',
		example: 1,
	})
	quantity: number;

	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Total price for this item',
		example: 4.99,
	})
	totalPrice: number;
}

export class CheckoutDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	@ApiProperty({
		description: 'Array of order items',
		type: [OrderItemDto],
	})
	items: OrderItemDto[];

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'ref code of the client',
		example: { uid: 1 },
	})
	client: { uid: number };

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'ref code of the owner',
		example: '123456',
	})
	owner: { uid: number };

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'ref code of the owner',
		example: '123456',
	})
	totalAmount: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'ref code of the owner',
		example: '123456',
	})
	totalItems: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'ref code of the owner',
		example: '123456',
	})
	promoCode: string;
}
