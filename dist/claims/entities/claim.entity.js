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
exports.Claim = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const finance_enums_1 = require("../../lib/enums/finance.enums");
const typeorm_1 = require("typeorm");
let Claim = class Claim {
};
exports.Claim = Claim;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Claim.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Claim.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Claim.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Claim.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Claim.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Claim.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Claim.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Claim.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 5000 }),
    __metadata("design:type", String)
], Claim.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Claim.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: finance_enums_1.ClaimStatus, default: finance_enums_1.ClaimStatus.PENDING }),
    __metadata("design:type", String)
], Claim.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: finance_enums_1.ClaimCategory, nullable: true, default: finance_enums_1.ClaimCategory.GENERAL }),
    __metadata("design:type", String)
], Claim.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user?.userClaims),
    __metadata("design:type", user_entity_1.User)
], Claim.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.claims),
    __metadata("design:type", branch_entity_1.Branch)
], Claim.prototype, "branch", void 0);
exports.Claim = Claim = __decorate([
    (0, typeorm_1.Entity)('claim')
], Claim);
//# sourceMappingURL=claim.entity.js.map