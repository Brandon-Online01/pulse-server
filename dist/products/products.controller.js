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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_2 = require("@nestjs/swagger");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const role_decorator_1 = require("../decorators/role.decorator");
const products_service_1 = require("./products.service");
const user_enums_1 = require("../lib/enums/user.enums");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
const common_2 = require("@nestjs/common");
const product_analytics_dto_1 = require("./dto/product-analytics.dto");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    createProduct(createProductDto) {
        return this.productsService.createProduct(createProductDto);
    }
    products(query) {
        return this.productsService.products(query.page, query.limit);
    }
    getProductByref(ref) {
        return this.productsService.getProductByref(ref);
    }
    productsBySearchTerm(category) {
        return this.productsService.productsBySearchTerm(category);
    }
    updateProduct(ref, updateProductDto) {
        return this.productsService.updateProduct(ref, updateProductDto);
    }
    restoreProduct(ref) {
        return this.productsService.restoreProduct(ref);
    }
    deleteProduct(ref) {
        return this.productsService.deleteProduct(ref);
    }
    async getProductAnalytics(id) {
        return this.productsService.getProductAnalytics(id);
    }
    async updateProductAnalytics(id, analyticsDto) {
        return this.productsService.updateProductAnalytics(id, analyticsDto);
    }
    async recordProductView(id) {
        return this.productsService.recordView(id);
    }
    async recordCartAdd(id) {
        return this.productsService.recordCartAdd(id);
    }
    async recordWishlist(id) {
        return this.productsService.recordWishlist(id);
    }
    async calculatePerformance(id) {
        return this.productsService.calculateProductPerformance(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_2.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'create a product' }),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_2.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'get a list of products i.e /products?page=1&limit=10' }),
    __param(0, (0, common_2.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "products", null);
__decorate([
    (0, common_2.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'get a product by reference code' }),
    __param(0, (0, common_2.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getProductByref", null);
__decorate([
    (0, common_2.Get)('category/:category'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'get a list of products by category i.e products/category/specials?page=1&limit=10' }),
    __param(0, (0, common_2.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "productsBySearchTerm", null);
__decorate([
    (0, common_2.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'update a product' }),
    __param(0, (0, common_2.Param)('ref')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_2.Patch)('restore/:ref'),
    (0, swagger_2.ApiOperation)({ summary: 'Restore a deleted product by reference code' }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    __param(0, (0, common_2.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "restoreProduct", null);
__decorate([
    (0, common_2.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'soft delete a product' }),
    __param(0, (0, common_2.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "deleteProduct", null);
__decorate([
    (0, common_2.Get)(':id/analytics'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductAnalytics", null);
__decorate([
    (0, common_2.Post)(':id/analytics'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, product_analytics_dto_1.ProductAnalyticsDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProductAnalytics", null);
__decorate([
    (0, common_2.Post)(':id/record-view'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "recordProductView", null);
__decorate([
    (0, common_2.Post)(':id/record-cart-add'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "recordCartAdd", null);
__decorate([
    (0, common_2.Post)(':id/record-wishlist'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "recordWishlist", null);
__decorate([
    (0, common_2.Post)(':id/calculate-performance'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "calculatePerformance", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('products'),
    (0, common_2.Controller)('products'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map