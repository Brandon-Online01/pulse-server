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
exports.ShopController = void 0;
const common_1 = require("@nestjs/common");
const shop_service_1 = require("./shop.service");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const checkout_dto_1 = require("./dto/checkout.dto");
const user_enums_1 = require("../lib/enums/user.enums");
const create_banner_dto_1 = require("./dto/create-banner.dto");
const update_banner_dto_1 = require("./dto/update-banner.dto");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
const status_enums_1 = require("../lib/enums/status.enums");
let ShopController = class ShopController {
    constructor(shopService) {
        this.shopService = shopService;
    }
    getBestSellers() {
        return this.shopService.getBestSellers();
    }
    getNewArrivals() {
        return this.shopService.getNewArrivals();
    }
    getHotDeals() {
        return this.shopService.getHotDeals();
    }
    categories() {
        return this.shopService.categories();
    }
    specials() {
        return this.shopService.specials();
    }
    createQuotation(quotationData) {
        return this.shopService.createQuotation(quotationData);
    }
    getQuotations() {
        return this.shopService.getAllQuotations();
    }
    getQuotationByRef(ref) {
        return this.shopService.getQuotationByRef(ref);
    }
    getQuotationsByUser(ref) {
        return this.shopService.getQuotationsByUser(ref);
    }
    async updateQuotationStatus(ref, status) {
        await this.shopService.updateQuotationStatus(ref, status);
        return {
            message: process.env.SUCCESS_MESSAGE
        };
    }
    getBanner() {
        return this.shopService.getBanner();
    }
    createBanner(bannerData) {
        return this.shopService.createBanner(bannerData);
    }
    updateBanner(ref, bannerData) {
        return this.shopService.updateBanner(ref, bannerData);
    }
    deleteBanner(ref) {
        return this.shopService.deleteBanner(ref);
    }
    async generateMissingSKUs() {
        return this.shopService.generateSKUsForExistingProducts();
    }
    async regenerateAllSKUs() {
        return this.shopService.regenerateAllSKUs();
    }
};
exports.ShopController = ShopController;
__decorate([
    (0, common_1.Get)('best-sellers'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of best selling products',
        description: 'Retrieves a list of products that have the highest sales volume'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Best selling products retrieved successfully',
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
                            imageUrl: { type: 'string' },
                            salesCount: { type: 'number' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getBestSellers", null);
__decorate([
    (0, common_1.Get)('new-arrivals'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of newly arrived products',
        description: 'Retrieves a list of products that were recently added to the inventory'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'New arrivals retrieved successfully',
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
                            imageUrl: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getNewArrivals", null);
__decorate([
    (0, common_1.Get)('hot-deals'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of products with hot deals',
        description: 'Retrieves a list of products that are currently on sale or have special promotions'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Hot deals retrieved successfully',
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
                            originalPrice: { type: 'number' },
                            salePrice: { type: 'number' },
                            discountPercentage: { type: 'number' },
                            imageUrl: { type: 'string' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getHotDeals", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of categories',
        description: 'Retrieves all product categories available in the shop'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Categories retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                categories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            productCount: { type: 'number' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('specials'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of specials',
        description: 'Retrieves all special offers and promotions currently available'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Specials retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                specials: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' },
                            discountPercentage: { type: 'number' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "specials", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Checkout a list of products',
        description: 'Creates a quotation for the selected products in the shopping cart'
    }),
    (0, swagger_1.ApiBody)({ type: checkout_dto_1.CheckoutDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Quotation created successfully',
        schema: {
            type: 'object',
            properties: {
                quotation: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        reference: { type: 'string' },
                        totalAmount: { type: 'number' },
                        status: { type: 'string' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'number' },
                                    quantity: { type: 'number' },
                                    unitPrice: { type: 'number' },
                                    subtotal: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating quotation' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkout_dto_1.CheckoutDto]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "createQuotation", null);
__decorate([
    (0, common_1.Get)('quotations'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of all quotations',
        description: 'Retrieves all quotations created in the system'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Quotations retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                quotations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            reference: { type: 'string' },
                            totalAmount: { type: 'number' },
                            status: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            user: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number' },
                                    name: { type: 'string' },
                                    email: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getQuotations", null);
__decorate([
    (0, common_1.Get)('quotations/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a quotation by reference',
        description: 'Retrieves detailed information about a specific quotation'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Quotation reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Quotation retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                quotation: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        reference: { type: 'string' },
                        totalAmount: { type: 'number' },
                        status: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    product: {
                                        type: 'object',
                                        properties: {
                                            uid: { type: 'number' },
                                            name: { type: 'string' },
                                            description: { type: 'string' },
                                            price: { type: 'number' },
                                            imageUrl: { type: 'string' }
                                        }
                                    },
                                    quantity: { type: 'number' },
                                    unitPrice: { type: 'number' },
                                    subtotal: { type: 'number' }
                                }
                            }
                        },
                        user: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number' },
                                name: { type: 'string' },
                                email: { type: 'string' }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Quotation not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Quotation not found' },
                quotation: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getQuotationByRef", null);
__decorate([
    (0, common_1.Get)('quotations/by/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of quotations owned by user',
        description: 'Retrieves all quotations created by a specific user'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'User reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User quotations retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                quotations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            reference: { type: 'string' },
                            totalAmount: { type: 'number' },
                            status: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found or has no quotations',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'No quotations found for this user' },
                quotations: { type: 'array', items: {}, example: [] }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getQuotationsByUser", null);
__decorate([
    (0, common_1.Patch)('quotations/:ref/status'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update quotation status',
        description: 'Updates the status of a quotation and triggers analytics updates'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Quotation reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: Object.values(status_enums_1.OrderStatus),
                    description: 'New status for the quotation'
                }
            },
            required: ['status']
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Quotation status updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Quotation not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Quotation not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid status provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid status' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "updateQuotationStatus", null);
__decorate([
    (0, common_1.Get)('banners'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a list of banners',
        description: 'Retrieves all banners configured for the shop'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Banners retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                banners: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            imageUrl: { type: 'string' },
                            linkUrl: { type: 'string' },
                            isActive: { type: 'boolean' },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "getBanner", null);
__decorate([
    (0, common_1.Post)('banners'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a banner',
        description: 'Creates a new banner for the shop'
    }),
    (0, swagger_1.ApiBody)({ type: create_banner_dto_1.CreateBannerDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Banner created successfully',
        schema: {
            type: 'object',
            properties: {
                banner: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        imageUrl: { type: 'string' },
                        linkUrl: { type: 'string' },
                        isActive: { type: 'boolean' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating banner' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_banner_dto_1.CreateBannerDto]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "createBanner", null);
__decorate([
    (0, common_1.Patch)('banners/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a banner',
        description: 'Updates an existing banner with the provided information'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Banner reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_banner_dto_1.UpdateBannerDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Banner updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Banner not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Banner not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating banner' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_banner_dto_1.UpdateBannerDto]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "updateBanner", null);
__decorate([
    (0, common_1.Delete)('banners/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a banner',
        description: 'Deletes a banner from the system'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Banner reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Banner deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Banner not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Banner not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "deleteBanner", null);
__decorate([
    (0, common_1.Post)('generate-missing-skus'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate missing SKUs for products',
        description: 'Generates SKUs for products that do not have them'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'SKUs generated successfully',
        schema: {
            type: 'object',
            properties: {
                generatedCount: { type: 'number', example: 10 },
                message: { type: 'string', example: 'Successfully generated SKUs for products' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "generateMissingSKUs", null);
__decorate([
    (0, common_1.Post)('regenerate-all-skus'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Regenerate all SKUs for products',
        description: 'Regenerates SKUs for all products in the system'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'All SKUs regenerated successfully',
        schema: {
            type: 'object',
            properties: {
                regeneratedCount: { type: 'number', example: 50 },
                message: { type: 'string', example: 'Successfully regenerated all SKUs' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "regenerateAllSKUs", null);
exports.ShopController = ShopController = __decorate([
    (0, swagger_1.ApiTags)('shop'),
    (0, common_1.Controller)('shop'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('shop'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [shop_service_1.ShopService])
], ShopController);
//# sourceMappingURL=shop.controller.js.map