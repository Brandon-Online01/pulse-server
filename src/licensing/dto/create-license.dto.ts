import { ApiProperty } from '@nestjs/swagger';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsBoolean,
	IsDateString,
	IsString,
	Min,
	IsObject,
} from 'class-validator';
import { LicenseType, SubscriptionPlan, BillingCycle } from '../../lib/enums/license.enums';

export class CreateLicenseDto {
	@ApiProperty({
		enum: LicenseType,
		example: 'PERPETUAL',
		description: 'Type of license (PERPETUAL, SUBSCRIPTION, TRIAL, ENTERPRISE)',
		examples: {
			perpetual: { value: 'PERPETUAL', description: 'One-time purchase, no expiry' },
			subscription: { value: 'SUBSCRIPTION', description: 'Recurring billing' },
			trial: { value: 'TRIAL', description: '30-day trial period' },
			enterprise: { value: 'ENTERPRISE', description: 'Custom enterprise agreement' },
		},
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
				description: '5 users, 1 branch, 5GB storage, basic features',
			},
			professional: {
				value: 'professional',
				description: '20 users, 3 branches, 20GB storage, advanced features',
			},
			business: {
				value: 'business',
				description: '50 users, 10 branches, 100GB storage, premium features',
			},
			enterprise: {
				value: 'enterprise',
				description: 'Unlimited users/branches, 1TB storage, all features',
			},
		},
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
			custom: { value: 'CUSTOM', description: 'Custom billing cycle (Enterprise only)' },
		},
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
			enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' },
		},
		minimum: 1,
	})
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	maxUsers: number;

	@ApiProperty({
		example: 5,
		description: 'Maximum number of branches allowed',
		examples: {
			starter: { value: 10, description: 'Starter plan: 10 branches' },
			professional: { value: 25, description: 'Professional plan: 25 branches' },
			business: { value: 100, description: 'Business plan: 100 branches' },
			enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' },
		},
		minimum: 1,
	})
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	maxBranches: number;

	@ApiProperty({
		example: 51200,
		description: 'Storage limit in MB',
		examples: {
			starter: { value: 51200, description: 'Starter plan: 50GB' },
			professional: { value: 204800, description: 'Professional plan: 200GB' },
			business: { value: 512000, description: 'Business plan: 500GB' },
			enterprise: { value: 5242880, description: 'Enterprise plan: 5TB' },
		},
		minimum: 1,
	})
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	storageLimit: number;

	@ApiProperty({
		example: 100000,
		description: 'Monthly API call limit',
		examples: {
			starter: { value: 100000, description: 'Starter plan: 100k calls' },
			professional: { value: 500000, description: 'Professional plan: 500k calls' },
			business: { value: 2000000, description: 'Business plan: 2M calls' },
			enterprise: { value: 10000000, description: 'Enterprise plan: 10M calls' },
		},
		minimum: 1,
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
			enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' },
		},
		minimum: 1,
	})
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	integrationLimit: number;

	@ApiProperty({
		example: '2024-01-07T00:00:00.000Z',
		description: 'License validity start date',
	})
	@IsNotEmpty()
	@IsDateString()
	validFrom: Date;

	@ApiProperty({
		example: '2025-01-07T23:59:59.999Z',
		description: 'License validity end date',
	})
	@IsNotEmpty()
	@IsDateString()
	validUntil: Date;

	@ApiProperty({
		example: true,
		description: 'Whether the license should auto-renew',
		required: false,
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
			enterprise: { value: 999, description: 'Enterprise plan base price' },
		},
		minimum: 0,
	})
	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	price: number;

	@ApiProperty({
		required: false,
		description: 'Feature flags will be set automatically based on plan',
		example: null,
	})
	@IsOptional()
	@IsObject()
	features?: Record<string, boolean>;

	@ApiProperty({
		example: '2',
		description: 'Reference to the organization this license belongs to',
	})
	@IsNotEmpty()
	@IsString()
	organisationRef: string;
}
