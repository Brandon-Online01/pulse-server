import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, IsString, Min, IsObject } from 'class-validator';
import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';

export class CreateLicenseDto {
    @ApiProperty({
        enum: LicenseType,
        example: 'PERPETUAL',
        description: 'Type of license (PERPETUAL, SUBSCRIPTION, TRIAL, ENTERPRISE)',
        examples: {
            perpetual: { value: 'PERPETUAL', description: 'One-time purchase, no expiry' },
            subscription: { value: 'SUBSCRIPTION', description: 'Recurring billing' },
            trial: { value: 'TRIAL', description: '30-day trial period' },
            enterprise: { value: 'ENTERPRISE', description: 'Custom enterprise agreement' }
        }
    })
    @IsNotEmpty()
    @IsEnum(LicenseType)
    type: LicenseType;

    @ApiProperty({
        enum: SubscriptionPlan,
        example: 'STARTER',
        description: 'Subscription plan level with feature sets',
        examples: {
            starter: {
                value: 'starter',
                description: '5 users, 1 branch, 5GB storage, basic features'
            },
            professional: {
                value: 'professional',
                description: '20 users, 3 branches, 20GB storage, advanced features'
            },
            business: {
                value: 'business',
                description: '50 users, 10 branches, 100GB storage, premium features'
            },
            enterprise: {
                value: 'enterprise',
                description: 'Unlimited users/branches, 1TB storage, all features'
            }
        }
    })
    @IsNotEmpty()
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;

    @ApiProperty({
        enum: BillingCycle,
        example: 'MONTHLY',
        description: 'Billing cycle for subscription',
        examples: {
            monthly: { value: 'MONTHLY', description: 'Billed every month' },
            annual: { value: 'ANNUAL', description: 'Billed yearly (20% discount)' },
            custom: { value: 'CUSTOM', description: 'Custom billing cycle (Enterprise only)' }
        }
    })
    @IsNotEmpty()
    @IsEnum(BillingCycle)
    billingCycle: BillingCycle;

    @ApiProperty({
        example: 5,
        description: 'Maximum number of users allowed',
        examples: {
            starter: { value: 5, description: 'Starter plan limit' },
            professional: { value: 20, description: 'Professional plan limit' },
            business: { value: 50, description: 'Business plan limit' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' }
        },
        minimum: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxUsers: number;

    @ApiProperty({
        example: 1,
        description: 'Maximum number of branches allowed',
        examples: {
            starter: { value: 1, description: 'Starter plan limit' },
            professional: { value: 3, description: 'Professional plan limit' },
            business: { value: 10, description: 'Business plan limit' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' }
        },
        minimum: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxBranches: number;

    @ApiProperty({
        example: 5120,
        description: 'Storage limit in MB',
        examples: {
            starter: { value: 5120, description: 'Starter plan: 5GB' },
            professional: { value: 20480, description: 'Professional plan: 20GB' },
            business: { value: 102400, description: 'Business plan: 100GB' },
            enterprise: { value: 1048576, description: 'Enterprise plan: 1TB' }
        },
        minimum: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    storageLimit: number;

    @ApiProperty({
        example: 10000,
        description: 'Monthly API call limit',
        examples: {
            starter: { value: 10000, description: 'Starter plan: 10k calls' },
            professional: { value: 50000, description: 'Professional plan: 50k calls' },
            business: { value: 200000, description: 'Business plan: 200k calls' },
            enterprise: { value: 1000000, description: 'Enterprise plan: 1M calls' }
        },
        minimum: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    apiCallLimit: number;

    @ApiProperty({
        example: 2,
        description: 'Number of integrations allowed',
        examples: {
            starter: { value: 2, description: 'Starter plan limit' },
            professional: { value: 5, description: 'Professional plan limit' },
            business: { value: 15, description: 'Business plan limit' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' }
        },
        minimum: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    integrationLimit: number;

    @ApiProperty({
        example: '2024-01-07T00:00:00.000Z',
        description: 'License validity start date'
    })
    @IsNotEmpty()
    @IsDateString()
    validFrom: Date;

    @ApiProperty({
        example: '2025-01-07T23:59:59.999Z',
        description: 'License validity end date'
    })
    @IsNotEmpty()
    @IsDateString()
    validUntil: Date;

    @ApiProperty({
        example: true,
        description: 'Whether the license should auto-renew',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isAutoRenew?: boolean;

    @ApiProperty({
        example: 99,
        description: 'License price',
        examples: {
            starter: { value: 99, description: 'Starter plan monthly price' },
            professional: { value: 199, description: 'Professional plan monthly price' },
            business: { value: 499, description: 'Business plan monthly price' },
            enterprise: { value: 999, description: 'Enterprise plan base price' }
        },
        minimum: 0
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        required: false,
        description: 'Feature flags will be set automatically based on plan',
        example: null
    })
    @IsOptional()
    @IsObject()
    features?: Record<string, boolean>;

    @ApiProperty({
        example: '2',
        description: 'Reference to the organization this license belongs to'
    })
    @IsNotEmpty()
    @IsString()
    organisationRef: string;
} 