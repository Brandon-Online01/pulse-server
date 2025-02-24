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
var Product_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const product_enums_1 = require("../../lib/enums/product.enums");
const quotation_item_entity_1 = require("../../shop/entities/quotation-item.entity");
const reseller_entity_1 = require("../../resellers/entities/reseller.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const product_analytics_entity_1 = require("./product-analytics.entity");
const typeorm_1 = require("typeorm");
let Product = Product_1 = class Product {
    static generateSKU(category, name, uid, reseller) {
        const categoryCode = (category || 'XXX').slice(0, 3).toUpperCase();
        const nameCode = (name || 'XXX').slice(0, 3).toUpperCase();
        const resellerCode = reseller ? reseller.uid.toString().padStart(3, '0') : '000';
        const paddedUid = uid.toString().padStart(6, '0');
        return `${categoryCode}-${nameCode}-${resellerCode}-${paddedUid}`;
    }
    async generateSKUBeforeInsert() {
        if (!this.sku && this.category && this.name) {
            this.sku = Product_1.generateSKU(this.category, this.name, 0, this.reseller);
        }
    }
    async updateSKUWithCorrectUid() {
        const repository = (0, typeorm_1.getRepository)(Product_1);
        this.sku = Product_1.generateSKU(this.category, this.name, this.uid, this.reseller);
        await repository.save(this);
    }
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: product_enums_1.ProductStatus, default: product_enums_1.ProductStatus.NEW }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "warehouseLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "stockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "productRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Product.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "salePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "barcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "packageQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isOnPromotion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "packageDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "promotionStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "promotionEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'unit' }),
    __metadata("design:type", String)
], Product.prototype, "packageUnit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_item_entity_1.QuotationItem, quotationItem => quotationItem?.product),
    __metadata("design:type", Array)
], Product.prototype, "quotationItems", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reseller_entity_1.Reseller, reseller => reseller?.products),
    __metadata("design:type", reseller_entity_1.Reseller)
], Product.prototype, "reseller", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation?.products, { nullable: true }),
    __metadata("design:type", organisation_entity_1.Organisation)
], Product.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.products, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], Product.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => product_analytics_entity_1.ProductAnalytics, analytics => analytics?.product, { cascade: true }),
    __metadata("design:type", product_analytics_entity_1.ProductAnalytics)
], Product.prototype, "analytics", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Product.prototype, "generateSKUBeforeInsert", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Product.prototype, "updateSKUWithCorrectUid", null);
exports.Product = Product = Product_1 = __decorate([
    (0, typeorm_1.Entity)('product')
], Product);
//# sourceMappingURL=product.entity.js.map