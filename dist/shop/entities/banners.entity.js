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
exports.Banners = void 0;
const branch_entity_1 = require("../../branch/entities/branch.entity");
const category_enum_1 = require("../../lib/enums/category.enum");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const typeorm_1 = require("typeorm");
let Banners = class Banners {
};
exports.Banners = Banners;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Banners.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'varchar' }),
    __metadata("design:type", String)
], Banners.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'varchar' }),
    __metadata("design:type", String)
], Banners.prototype, "subtitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'varchar' }),
    __metadata("design:type", String)
], Banners.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'varchar' }),
    __metadata("design:type", String)
], Banners.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], Banners.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], Banners.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'enum', enum: category_enum_1.BannerCategory, default: category_enum_1.BannerCategory.NEWS }),
    __metadata("design:type", String)
], Banners.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation?.banners, { nullable: true }),
    __metadata("design:type", organisation_entity_1.Organisation)
], Banners.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.banners, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], Banners.prototype, "branch", void 0);
exports.Banners = Banners = __decorate([
    (0, typeorm_1.Entity)('banners')
], Banners);
//# sourceMappingURL=banners.entity.js.map