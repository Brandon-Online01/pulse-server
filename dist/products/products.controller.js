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
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_2.ApiOperation)({
        summary: 'Create a product',
        description: 'Creates a new product with the provided details'
    }),
    (0, swagger_2.ApiBody)({ type: create_product_dto_1.CreateProductDto }),
    (0, swagger_2.ApiCreatedResponse)({
        description: 'Product created successfully',
        schema: {
            type: 'object',
            properties: {
                product: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        sku: { type: 'string' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating product' }
            }
        }
    }),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_2.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_2.ApiOperation)({
        summary: 'Get a list of products',
        description: 'Retrieves a paginated list of products'
    }),
    (0, swagger_2.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' }),
    (0, swagger_2.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Number of records per page, defaults to system setting' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Products retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            price: { type: 'number' },
                            sku: { type: 'string' },
                            imageUrl: { type: 'string' },
                            category: { type: 'string' },
                            isActive: { type: 'boolean' }
                        }
                    }
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 10 }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __param(0, (0, common_2.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "products", null);
__decorate([
    (0, common_2.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_2.ApiOperation)({
        summary: 'Get a product by reference code',
        description: 'Retrieves detailed information about a specific product'
    }),
    (0, swagger_2.ApiParam)({ name: 'ref', description: 'Product reference code or ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                product: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        sku: { type: 'string' },
                        imageUrl: { type: 'string' },
                        category: { type: 'string' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' },
                product: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getProductByref", null);
__decorate([
    (0, common_2.Get)('category/:category'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_2.ApiOperation)({
        summary: 'Get a list of products by category',
        description: 'Retrieves a list of products that belong to a specific category'
    }),
    (0, swagger_2.ApiParam)({ name: 'category', description: 'Category name or ID', type: 'string' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Products retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            price: { type: 'number' },
                            sku: { type: 'string' },
                            imageUrl: { type: 'string' },
                            category: { type: 'string' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'No products found in this category',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'No products found in this category' },
                products: { type: 'array', items: {}, example: [] }
            }
        }
    }),
    __param(0, (0, common_2.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "productsBySearchTerm", null);
__decorate([
    (0, common_2.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_2.ApiOperation)({
        summary: 'Update a product',
        description: 'Updates an existing product with the provided information'
    }),
    (0, swagger_2.ApiParam)({ name: 'ref', description: 'Product reference code or ID', type: 'number' }),
    (0, swagger_2.ApiBody)({ type: update_product_dto_1.UpdateProductDto }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    (0, swagger_2.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating product' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('ref')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_2.Patch)('restore/:ref'),
    (0, swagger_2.ApiOperation)({
        summary: 'Restore a deleted product',
        description: 'Restores a previously deleted product'
    }),
    (0, swagger_2.ApiParam)({ name: 'ref', description: 'Product reference code or ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    __param(0, (0, common_2.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "restoreProduct", null);
__decorate([
    (0, common_2.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_2.ApiOperation)({
        summary: 'Soft delete a product',
        description: 'Marks a product as deleted without removing it from the database'
    }),
    (0, swagger_2.ApiParam)({ name: 'ref', description: 'Product reference code or ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "deleteProduct", null);
__decorate([
    (0, common_2.Get)(':id/analytics'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_2.ApiOperation)({
        summary: 'Get product analytics',
        description: 'Retrieves analytics data for a specific product'
    }),
    (0, swagger_2.ApiParam)({ name: 'id', description: 'Product ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product analytics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                analytics: {
                    type: 'object',
                    properties: {
                        views: { type: 'number' },
                        cartAdds: { type: 'number' },
                        wishlistAdds: { type: 'number' },
                        purchases: { type: 'number' },
                        conversionRate: { type: 'number' },
                        performance: { type: 'number' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductAnalytics", null);
__decorate([
    (0, common_2.Post)(':id/analytics'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_2.ApiOperation)({
        summary: 'Update product analytics',
        description: 'Updates analytics data for a specific product'
    }),
    (0, swagger_2.ApiParam)({ name: 'id', description: 'Product ID', type: 'number' }),
    (0, swagger_2.ApiBody)({ type: product_analytics_dto_1.ProductAnalyticsDto }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product analytics updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    (0, swagger_2.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating product analytics' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, product_analytics_dto_1.ProductAnalyticsDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProductAnalytics", null);
__decorate([
    (0, common_2.Post)(':id/record-view'),
    (0, swagger_2.ApiOperation)({
        summary: 'Record product view',
        description: 'Increments the view count for a specific product'
    }),
    (0, swagger_2.ApiParam)({ name: 'id', description: 'Product ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product view recorded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "recordProductView", null);
__decorate([
    (0, common_2.Post)(':id/record-cart-add'),
    (0, swagger_2.ApiOperation)({
        summary: 'Record cart add',
        description: 'Increments the cart add count for a specific product'
    }),
    (0, swagger_2.ApiParam)({ name: 'id', description: 'Product ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Cart add recorded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "recordCartAdd", null);
__decorate([
    (0, common_2.Post)(':id/record-wishlist'),
    (0, swagger_2.ApiOperation)({
        summary: 'Record wishlist add',
        description: 'Increments the wishlist add count for a specific product'
    }),
    (0, swagger_2.ApiParam)({ name: 'id', description: 'Product ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Wishlist add recorded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "recordWishlist", null);
__decorate([
    (0, common_2.Post)(':id/calculate-performance'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_2.ApiOperation)({
        summary: 'Calculate product performance',
        description: 'Calculates performance metrics for a specific product based on analytics data'
    }),
    (0, swagger_2.ApiParam)({ name: 'id', description: 'Product ID', type: 'number' }),
    (0, swagger_2.ApiOkResponse)({
        description: 'Product performance calculated successfully',
        schema: {
            type: 'object',
            properties: {
                performance: { type: 'number' },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_2.ApiNotFoundResponse)({
        description: 'Product not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Product not found' }
            }
        }
    }),
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
    (0, swagger_2.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map