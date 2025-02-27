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
exports.Reseller = void 0;
const product_entity_1 = require("../../products/entities/product.entity");
const product_enums_1 = require("../../lib/enums/product.enums");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const typeorm_1 = require("typeorm");
let Reseller = class Reseller {
};
exports.Reseller = Reseller;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reseller.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'enum', enum: product_enums_1.ResellerStatus, default: product_enums_1.ResellerStatus.ACTIVE }),
    __metadata("design:type", String)
], Reseller.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 100, type: 'varchar' }),
    __metadata("design:type", String)
], Reseller.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Reseller.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Reseller.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Reseller.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'json' }),
    __metadata("design:type", Object)
], Reseller.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product?.reseller),
    __metadata("design:type", Array)
], Reseller.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation?.resellers, { nullable: true }),
    __metadata("design:type", organisation_entity_1.Organisation)
], Reseller.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.resellers, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], Reseller.prototype, "branch", void 0);
exports.Reseller = Reseller = __decorate([
    (0, typeorm_1.Entity)('reseller')
], Reseller);
//# sourceMappingURL=reseller.entity.js.map