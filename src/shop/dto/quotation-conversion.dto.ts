import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class QuotationConversionDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Notes about the conversion',
        required: false,
        example: 'Converted after client approval via email',
    })
    notes?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Payment method if payment info is included',
        required: false,
        example: 'credit_card',
    })
    paymentMethod?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Payment reference if payment is made',
        required: false,
        example: 'tx_123456789',
    })
    paymentReference?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Amount paid if partial payment is made',
        required: false,
        example: 500.00,
    })
    paidAmount?: number;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Mark order as paid during conversion',
        required: false,
        example: false,
    })
    markAsPaid?: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Shipping method',
        required: false,
        example: 'express',
    })
    shippingMethod?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Shipping instructions',
        required: false,
        example: 'Leave at front door',
    })
    shippingInstructions?: string;
} 