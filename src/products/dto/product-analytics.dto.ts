import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDate, IsObject, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ConversionHistoryItemDto {
    @IsNumber()
    @ApiProperty({
        description: 'Quotation ID',
        example: 123
    })
    quotationId: number;

    @IsNumber()
    @ApiProperty({
        description: 'Order ID',
        example: 456
    })
    orderId: number;

    @IsDate()
    @Type(() => Date)
    @ApiProperty({
        description: 'When the conversion happened',
        example: new Date()
    })
    convertedAt: Date;
}

export class ProductAnalyticsDto {
    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Total units sold',
        required: false,
        example: 100
    })
    totalUnitsSold?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Total revenue generated',
        required: false,
        example: 4999.99
    })
    totalRevenue?: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        description: 'Last sale date',
        required: false,
        example: new Date()
    })
    lastSaleDate?: Date;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Average selling price',
        required: false,
        example: 99.99
    })
    averageSellingPrice?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Sales count',
        required: false,
        example: 5000
    })
    salesCount?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Total purchase cost',
        required: false,
        example: 4999.99
    })
    totalPurchaseCost?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Units purchased',
        required: false,
        example: 100
    })
    unitsPurchased?: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @ApiProperty({
        description: 'Last purchase date',
        required: false,
        example: new Date()
    })
    lastPurchaseDate?: Date;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Average purchase price',
        required: false,
        example: 99.99
    })
    averagePurchasePrice?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Profit margin',
        required: false,
        example: 33.33
    })
    profitMargin?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Stock turnover rate',
        required: false,
        example: 1.5
    })
    stockTurnoverRate?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Days in inventory',
        required: false,
        example: 15
    })
    daysInInventory?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Return rate',
        required: false,
        example: 2.5
    })
    returnRate?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Customer satisfaction score',
        required: false,
        example: 4.5
    })
    customerSatisfactionScore?: number;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        description: 'Price history',
        required: false,
        type: Object
    })
    priceHistory?: any;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        description: 'Sales history',
        required: false,
        type: Object
    })
    salesHistory?: any;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        description: 'Stock history',
        required: false,
        type: Object
    })
    stockHistory?: any;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Category rank',
        required: false,
        example: 1
    })
    categoryRank?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Number of times product was viewed',
        required: false,
        example: 5000
    })
    viewCount?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Number of times product was added to cart',
        required: false,
        example: 200
    })
    cartAddCount?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Number of times product was included in a quotation',
        required: false,
        example: 150
    })
    quotationCount?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Number of times quotations with this product were converted to orders',
        required: false,
        example: 50
    })
    quotationToOrderCount?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Conversion rate from quotation to order (percentage)',
        required: false,
        example: 33.33
    })
    conversionRate?: number;

    @IsArray()
    @IsOptional()
    @Type(() => ConversionHistoryItemDto)
    @ApiProperty({
        description: 'History of conversions',
        required: false,
        type: [ConversionHistoryItemDto],
        example: [
            {
                quotationId: 123,
                orderId: 456,
                convertedAt: new Date()
            }
        ]
    })
    conversionHistory?: ConversionHistoryItemDto[];
} 