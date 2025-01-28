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
exports.License = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../lib/entities/base.entity");
const license_enums_1 = require("../../lib/enums/license.enums");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
let License = class License extends base_entity_1.BaseEntity {
};
exports.License = License;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], License.prototype, "licenseKey", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: license_enums_1.LicenseType,
        default: license_enums_1.LicenseType.PERPETUAL,
    }),
    __metadata("design:type", String)
], License.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: license_enums_1.SubscriptionPlan,
        default: license_enums_1.SubscriptionPlan.STARTER,
    }),
    __metadata("design:type", String)
], License.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: license_enums_1.LicenseStatus,
        default: license_enums_1.LicenseStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], License.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: license_enums_1.BillingCycle,
        default: license_enums_1.BillingCycle.MONTHLY,
    }),
    __metadata("design:type", String)
], License.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], License.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], License.prototype, "lastValidated", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], License.prototype, "maxUsers", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], License.prototype, "maxBranches", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], License.prototype, "storageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], License.prototype, "apiCallLimit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], License.prototype, "integrationLimit", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], License.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], License.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], License.prototype, "organisationRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], License.prototype, "hasPendingPayments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation),
    (0, typeorm_1.JoinColumn)({ name: 'organisationRef' }),
    __metadata("design:type", organisation_entity_1.Organisation)
], License.prototype, "organisation", void 0);
exports.License = License = __decorate([
    (0, typeorm_1.Entity)('licenses')
], License);
//# sourceMappingURL=license.entity.js.map