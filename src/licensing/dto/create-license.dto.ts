import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, IsString, Min, IsObject } from 'class-validator';
import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';

export class CreateLicenseDto {
    @ApiProperty({ enum: LicenseType })
    @IsNotEmpty()
    @IsEnum(LicenseType)
    type: LicenseType;

    @ApiProperty({ enum: SubscriptionPlan })
    @IsNotEmpty()
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;

    @ApiProperty({ enum: BillingCycle })
    @IsNotEmpty()
    @IsEnum(BillingCycle)
    billingCycle: BillingCycle;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxUsers: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxBranches: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    storageLimit: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    apiCallLimit: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    integrationLimit: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    validFrom: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    validUntil: Date;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isAutoRenew?: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty()
    @IsOptional()
    @IsObject()
    features?: Record<string, boolean>;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    organisationRef: string;
} 