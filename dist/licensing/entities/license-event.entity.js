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
exports.LicenseEvent = exports.LicenseEventType = void 0;
const typeorm_1 = require("typeorm");
const license_entity_1 = require("./license.entity");
var LicenseEventType;
(function (LicenseEventType) {
    LicenseEventType["CREATED"] = "created";
    LicenseEventType["RENEWED"] = "renewed";
    LicenseEventType["EXPIRED"] = "expired";
    LicenseEventType["SUSPENDED"] = "suspended";
    LicenseEventType["ACTIVATED"] = "activated";
    LicenseEventType["PLAN_CHANGED"] = "plan_changed";
    LicenseEventType["LIMIT_EXCEEDED"] = "limit_exceeded";
    LicenseEventType["GRACE_PERIOD_ENTERED"] = "grace_period_entered";
    LicenseEventType["GRACE_PERIOD_EXPIRED"] = "grace_period_expired";
    LicenseEventType["VALIDATION_FAILED"] = "validation_failed";
    LicenseEventType["FEATURE_ACCESS_DENIED"] = "feature_access_denied";
})(LicenseEventType || (exports.LicenseEventType = LicenseEventType = {}));
let LicenseEvent = class LicenseEvent {
};
exports.LicenseEvent = LicenseEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LicenseEvent.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => license_entity_1.License, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'licenseId' }),
    __metadata("design:type", license_entity_1.License)
], LicenseEvent.prototype, "license", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LicenseEvent.prototype, "licenseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: LicenseEventType }),
    __metadata("design:type", String)
], LicenseEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], LicenseEvent.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LicenseEvent.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LicenseEvent.prototype, "userIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LicenseEvent.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LicenseEvent.prototype, "timestamp", void 0);
exports.LicenseEvent = LicenseEvent = __decorate([
    (0, typeorm_1.Entity)('license_events')
], LicenseEvent);
//# sourceMappingURL=license-event.entity.js.map