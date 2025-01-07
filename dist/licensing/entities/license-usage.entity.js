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
exports.LicenseUsage = exports.MetricType = void 0;
const typeorm_1 = require("typeorm");
const license_entity_1 = require("./license.entity");
var MetricType;
(function (MetricType) {
    MetricType["USERS"] = "users";
    MetricType["BRANCHES"] = "branches";
    MetricType["STORAGE"] = "storage";
    MetricType["API_CALLS"] = "api_calls";
    MetricType["INTEGRATIONS"] = "integrations";
})(MetricType || (exports.MetricType = MetricType = {}));
let LicenseUsage = class LicenseUsage {
};
exports.LicenseUsage = LicenseUsage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LicenseUsage.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => license_entity_1.License, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'licenseId' }),
    __metadata("design:type", license_entity_1.License)
], LicenseUsage.prototype, "license", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LicenseUsage.prototype, "licenseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MetricType }),
    __metadata("design:type", String)
], LicenseUsage.prototype, "metricType", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], LicenseUsage.prototype, "currentValue", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], LicenseUsage.prototype, "limit", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], LicenseUsage.prototype, "utilizationPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], LicenseUsage.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LicenseUsage.prototype, "timestamp", void 0);
exports.LicenseUsage = LicenseUsage = __decorate([
    (0, typeorm_1.Entity)('license_usage')
], LicenseUsage);
//# sourceMappingURL=license-usage.entity.js.map