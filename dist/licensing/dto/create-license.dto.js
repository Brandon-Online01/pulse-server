"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLicenseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const license_enums_1 = require("../../lib/enums/license.enums");
class CreateLicenseDto {
}
exports.CreateLicenseDto = CreateLicenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: license_enums_1.LicenseType,
        example: 'PERPETUAL',
        description: 'Type of license (PERPETUAL, SUBSCRIPTION, TRIAL, ENTERPRISE)',
        examples: {
            perpetual: { value: 'PERPETUAL', description: 'One-time purchase, no expiry' },
            subscription: { value: 'SUBSCRIPTION', description: 'Recurring billing' },
            trial: { value: 'TRIAL', description: '30-day trial period' },
            enterprise: { value: 'ENTERPRISE', description: 'Custom enterprise agreement' }
        }
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(license_enums_1.LicenseType),
    __metadata("design:type", String)
], CreateLicenseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: license_enums_1.SubscriptionPlan,
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
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(license_enums_1.SubscriptionPlan),
    __metadata("design:type", String)
], CreateLicenseDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: license_enums_1.BillingCycle,
        example: 'MONTHLY',
        description: 'Billing cycle for subscription',
        examples: {
            monthly: { value: 'MONTHLY', description: 'Billed every month' },
            annual: { value: 'ANNUAL', description: 'Billed yearly (20% discount)' },
            custom: { value: 'CUSTOM', description: 'Custom billing cycle (Enterprise only)' }
        }
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(license_enums_1.BillingCycle),
    __metadata("design:type", String)
], CreateLicenseDto.prototype, "billingCycle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Maximum number of users allowed',
        examples: {
            starter: { value: 5, description: 'Starter plan limit' },
            professional: { value: 20, description: 'Professional plan limit' },
            business: { value: 50, description: 'Business plan limit' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' }
        },
        minimum: 1
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "maxUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Maximum number of branches allowed',
        examples: {
            starter: { value: 1, description: 'Starter plan limit' },
            professional: { value: 3, description: 'Professional plan limit' },
            business: { value: 10, description: 'Business plan limit' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' }
        },
        minimum: 1
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "maxBranches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5120,
        description: 'Storage limit in MB',
        examples: {
            starter: { value: 5120, description: 'Starter plan: 5GB' },
            professional: { value: 20480, description: 'Professional plan: 20GB' },
            business: { value: 102400, description: 'Business plan: 100GB' },
            enterprise: { value: 1048576, description: 'Enterprise plan: 1TB' }
        },
        minimum: 1
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "storageLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10000,
        description: 'Monthly API call limit',
        examples: {
            starter: { value: 10000, description: 'Starter plan: 10k calls' },
            professional: { value: 50000, description: 'Professional plan: 50k calls' },
            business: { value: 200000, description: 'Business plan: 200k calls' },
            enterprise: { value: 1000000, description: 'Enterprise plan: 1M calls' }
        },
        minimum: 1
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "apiCallLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2,
        description: 'Number of integrations allowed',
        examples: {
            starter: { value: 2, description: 'Starter plan limit' },
            professional: { value: 5, description: 'Professional plan limit' },
            business: { value: 15, description: 'Business plan limit' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' }
        },
        minimum: 1
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "integrationLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-07T00:00:00.000Z',
        description: 'License validity start date'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateLicenseDto.prototype, "validFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-01-07T23:59:59.999Z',
        description: 'License validity end date'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateLicenseDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the license should auto-renew',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLicenseDto.prototype, "isAutoRenew", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 99,
        description: 'License price',
        examples: {
            starter: { value: 99, description: 'Starter plan monthly price' },
            professional: { value: 199, description: 'Professional plan monthly price' },
            business: { value: 499, description: 'Business plan monthly price' },
            enterprise: { value: 999, description: 'Enterprise plan base price' }
        },
        minimum: 0
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Feature flags will be set automatically based on plan',
        example: null
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateLicenseDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2',
        description: 'Reference to the organization this license belongs to'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLicenseDto.prototype, "organisationRef", void 0);
//# sourceMappingURL=create-license.dto.js.map