import { IsNumber, IsOptional, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductAnalyticsDto {
    @IsNumber()
    @IsOptional()
    totalUnitsSold?: number;

    @IsNumber()
    @IsOptional()
    totalRevenue?: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    lastSaleDate?: Date;

    @IsNumber()
    @IsOptional()
    averageSellingPrice?: number;

    @IsNumber()
    @IsOptional()
    salesCount?: number;

    @IsNumber()
    @IsOptional()
    totalPurchaseCost?: number;

    @IsNumber()
    @IsOptional()
    unitsPurchased?: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    lastPurchaseDate?: Date;

    @IsNumber()
    @IsOptional()
    averagePurchasePrice?: number;

    @IsNumber()
    @IsOptional()
    profitMargin?: number;

    @IsNumber()
    @IsOptional()
    stockTurnoverRate?: number;

    @IsNumber()
    @IsOptional()
    daysInInventory?: number;

    @IsNumber()
    @IsOptional()
    returnRate?: number;

    @IsNumber()
    @IsOptional()
    customerSatisfactionScore?: number;

    @IsObject()
    @IsOptional()
    priceHistory?: any;

    @IsObject()
    @IsOptional()
    salesHistory?: any;

    @IsObject()
    @IsOptional()
    stockHistory?: any;

    @IsNumber()
    @IsOptional()
    categoryRank?: number;

    @IsNumber()
    @IsOptional()
    viewCount?: number;

    @IsNumber()
    @IsOptional()
    cartAddCount?: number;

    @IsNumber()
    @IsOptional()
    wishlistCount?: number;
} 