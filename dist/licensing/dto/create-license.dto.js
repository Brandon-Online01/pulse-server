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
const class_transformer_1 = require("class-transformer");
const license_enums_1 = require("../../lib/enums/license.enums");
const is_after_date_validator_1 = require("../lib/validators/is-after-date.validator");
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
            enterprise: { value: 'ENTERPRISE', description: 'Custom enterprise agreement' },
        },
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
            custom: { value: 'CUSTOM', description: 'Custom billing cycle (Enterprise only)' },
        },
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
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' },
        },
        minimum: 1,
        maximum: 1000000,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000000),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "maxUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Maximum number of branches allowed',
        examples: {
            starter: { value: 10, description: 'Starter plan: 10 branches' },
            professional: { value: 25, description: 'Professional plan: 25 branches' },
            business: { value: 100, description: 'Business plan: 100 branches' },
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' },
        },
        minimum: 1,
        maximum: 1000000,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000000),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "maxBranches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 51200,
        description: 'Storage limit in MB',
        examples: {
            starter: { value: 51200, description: 'Starter plan: 50GB' },
            professional: { value: 204800, description: 'Professional plan: 200GB' },
            business: { value: 512000, description: 'Business plan: 500GB' },
            enterprise: { value: 5242880, description: 'Enterprise plan: 5TB' },
        },
        minimum: 1,
        maximum: 10485760,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10485760),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "storageLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100000,
        description: 'Monthly API call limit',
        examples: {
            starter: { value: 100000, description: 'Starter plan: 100k calls' },
            professional: { value: 500000, description: 'Professional plan: 500k calls' },
            business: { value: 2000000, description: 'Business plan: 2M calls' },
            enterprise: { value: 10000000, description: 'Enterprise plan: 10M calls' },
        },
        minimum: 1,
        maximum: 100000000,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100000000),
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
            enterprise: { value: 999999, description: 'Enterprise plan (unlimited)' },
        },
        minimum: 1,
        maximum: 1000,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "integrationLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-07T00:00:00.000Z',
        description: 'License validity start date',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateLicenseDto.prototype, "validFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-01-07T23:59:59.999Z',
        description: 'License validity end date',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.Validate)(is_after_date_validator_1.IsAfterDate, ['validFrom']),
    __metadata("design:type", Date)
], CreateLicenseDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the license should auto-renew',
        required: false,
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
            enterprise: { value: 999, description: 'Enterprise plan base price' },
        },
        minimum: 0,
        maximum: 1000000,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1000000),
    __metadata("design:type", Number)
], CreateLicenseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Feature flags will be set automatically based on plan',
        example: null,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], CreateLicenseDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Reference to the organization this license belongs to',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLicenseDto.prototype, "organisationRef", void 0);
//# sourceMappingURL=create-license.dto.js.map