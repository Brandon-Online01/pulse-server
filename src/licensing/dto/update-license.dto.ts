import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min, IsObject } from 'class-validator';
import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';

export class UpdateLicenseDto {
    @ApiPropertyOptional({ enum: LicenseType })
    @IsOptional()
    @IsEnum(LicenseType)
    type?: LicenseType;

    @ApiPropertyOptional({ enum: SubscriptionPlan })
    @IsOptional()
    @IsEnum(SubscriptionPlan)
    plan?: SubscriptionPlan;

    @ApiPropertyOptional({ enum: LicenseStatus })
    @IsOptional()
    @IsEnum(LicenseStatus)
    status?: LicenseStatus;

    @ApiPropertyOptional({ enum: BillingCycle })
    @IsOptional()
    @IsEnum(BillingCycle)
    billingCycle?: BillingCycle;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    maxUsers?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    maxBranches?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    storageLimit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    apiCallLimit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    integrationLimit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    validFrom?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    validUntil?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isAutoRenew?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    features?: Record<string, boolean>;
} 