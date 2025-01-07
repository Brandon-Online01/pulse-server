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
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const license_enums_1 = require("../../lib/enums/license.enums");
const typeorm_1 = require("typeorm");
let License = class License {
};
exports.License = License;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], License.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], License.prototype, "licenseKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: license_enums_1.LicenseType }),
    __metadata("design:type", String)
], License.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: license_enums_1.SubscriptionPlan }),
    __metadata("design:type", String)
], License.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: license_enums_1.LicenseStatus }),
    __metadata("design:type", String)
], License.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: license_enums_1.BillingCycle }),
    __metadata("design:type", String)
], License.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], License.prototype, "maxUsers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], License.prototype, "maxBranches", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], License.prototype, "storageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], License.prototype, "apiCallLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], License.prototype, "integrationLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], License.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], License.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], License.prototype, "lastValidated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], License.prototype, "isAutoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], License.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], License.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organisationRef' }),
    __metadata("design:type", organisation_entity_1.Organisation)
], License.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], License.prototype, "organisationRef", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], License.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], License.prototype, "updatedAt", void 0);
exports.License = License = __decorate([
    (0, typeorm_1.Entity)('licenses')
], License);
//# sourceMappingURL=license.entity.js.map