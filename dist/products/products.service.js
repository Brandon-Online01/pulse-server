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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("./entities/product.entity");
const typeorm_1 = require("typeorm");
const product_enums_1 = require("../lib/enums/product.enums");
const typeorm_2 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const event_emitter_1 = require("@nestjs/event-emitter");
const product_analytics_entity_1 = require("./entities/product-analytics.entity");
let ProductsService = class ProductsService {
    constructor(productRepository, analyticsRepository, cacheManager, eventEmitter) {
        this.productRepository = productRepository;
        this.analyticsRepository = analyticsRepository;
        this.cacheManager = cacheManager;
        this.eventEmitter = eventEmitter;
        this.CACHE_PREFIX = 'products:';
        this.CACHE_TTL = Number(process.env.CACHE_EXPIRATION_TIME) || 30;
    }
    getCacheKey(key) {
        return `${this.CACHE_PREFIX}${key}`;
    }
    async invalidateProductCache(product) {
        try {
            const keys = await this.cacheManager.store.keys();
            const keysToDelete = [];
            keysToDelete.push(this.getCacheKey(product.uid), `${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}stats`);
            if (product.category) {
                keysToDelete.push(`${this.CACHE_PREFIX}category_${product.category}`);
            }
            if (product.status) {
                keysToDelete.push(`${this.CACHE_PREFIX}status_${product.status}`);
            }
            const productListCaches = keys.filter(key => key.startsWith(`${this.CACHE_PREFIX}page`) ||
                key.startsWith(`${this.CACHE_PREFIX}search`) ||
                key.includes('_limit'));
            keysToDelete.push(...productListCaches);
            await Promise.all(keysToDelete.map(key => this.cacheManager.del(key)));
            this.eventEmitter.emit('products.cache.invalidate', {
                productId: product.uid,
                keys: keysToDelete
            });
        }
        catch (error) {
            console.error('Error invalidating product cache:', error);
        }
    }
    async createProduct(createProductDto) {
        try {
            const product = await this.productRepository.save(createProductDto);
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.analyticsRepository.save(this.analyticsRepository.create({
                productId: product.uid,
                totalUnitsSold: 0,
                totalRevenue: 0,
                salesCount: 0,
                viewCount: 0,
                cartAddCount: 0,
                wishlistCount: 0,
                stockHistory: [{
                        date: new Date(),
                        quantity: product.stockQuantity || 0,
                        type: 'initial',
                        balance: product.stockQuantity || 0
                    }],
                priceHistory: [{
                        date: new Date(),
                        price: product.price,
                        type: 'initial'
                    }]
            }));
            await this.invalidateProductCache(product);
            return {
                product: product,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                product: null
            };
        }
    }
    async updateProduct(ref, updateProductDto) {
        try {
            const existingProduct = await this.productRepository.findOne({
                where: { uid: ref }
            });
            if (!existingProduct) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (updateProductDto.price && updateProductDto.price !== existingProduct.price) {
                await this.updatePriceHistory(ref, Number(updateProductDto.price), 'update');
            }
            if (updateProductDto.stockQuantity && updateProductDto.stockQuantity !== existingProduct.stockQuantity) {
                const difference = updateProductDto.stockQuantity - existingProduct.stockQuantity;
                await this.updateStockHistory(ref, Math.abs(difference), difference > 0 ? 'in' : 'out');
            }
            await this.productRepository.update(ref, updateProductDto);
            await this.invalidateProductCache(existingProduct);
            await this.calculateProductPerformance(ref);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async deleteProduct(ref) {
        try {
            const product = await this.productRepository.findOne({
                where: { uid: ref }
            });
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.productRepository.update(ref, { isDeleted: true });
            await this.invalidateProductCache(product);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async restoreProduct(ref) {
        try {
            const product = await this.productRepository.findOne({
                where: { uid: ref }
            });
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.productRepository.update(ref, { isDeleted: false });
            await this.invalidateProductCache(product);
            const response = {
                message: process.env.SUCCESS_MESSAGE
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async products(page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const cacheKey = `products_page${page}_limit${limit}`;
            const cachedProducts = await this.cacheManager.get(cacheKey);
            if (cachedProducts) {
                return cachedProducts;
            }
            const [products, total] = await this.productRepository.findAndCount({
                where: {
                    status: (0, typeorm_1.Not)((0, typeorm_1.In)([product_enums_1.ProductStatus.DISCONTINUED, product_enums_1.ProductStatus.HIDDEN, product_enums_1.ProductStatus.DELETED])),
                    isDeleted: false
                },
                skip: (page - 1) * limit,
                take: limit,
                order: {
                    createdAt: 'DESC'
                }
            });
            if (!products) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                data: products,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, response, Number(process.env.CACHE_EXPIRATION_TIME));
            return response;
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
                message: error?.message,
            };
        }
    }
    async getProductByref(ref) {
        try {
            const product = await this.productRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false
                }
            });
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                product: product,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                product: null
            };
            return response;
        }
    }
    async productsBySearchTerm(searchTerm, page = 1, limit = 10) {
        try {
            const cacheKey = `search_${searchTerm?.toLowerCase()}_page${page}_limit${limit}`;
            const cachedResults = await this.cacheManager.get(cacheKey);
            if (cachedResults) {
                return cachedResults;
            }
            const searchPattern = `%${searchTerm?.toLowerCase()}%`;
            const [products, total] = await this.productRepository.findAndCount({
                where: [
                    { category: (0, typeorm_1.Like)(searchPattern), isDeleted: false },
                    { status: (0, typeorm_1.Like)(searchTerm?.toLowerCase()), isDeleted: false }
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: {
                    createdAt: 'DESC'
                }
            });
            if (!products) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                data: products,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, response, Number(process.env.CACHE_EXPIRATION_TIME));
            return response;
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
                message: error?.message,
            };
        }
    }
    async updateProductAnalytics(productId, data) {
        let analytics = await this.analyticsRepository.findOne({
            where: { productId }
        });
        if (!analytics) {
            analytics = this.analyticsRepository.create({
                productId,
                ...data
            });
        }
        else {
            this.analyticsRepository.merge(analytics, data);
        }
        return this.analyticsRepository.save(analytics);
    }
    async getProductAnalytics(productId) {
        return this.analyticsRepository.findOne({
            where: { productId }
        });
    }
    async updatePriceHistory(productId, newPrice, type) {
        const analytics = await this.getProductAnalytics(productId);
        const priceHistory = analytics?.priceHistory || [];
        priceHistory.push({
            date: new Date(),
            price: newPrice,
            type
        });
        return this.updateProductAnalytics(productId, {
            priceHistory
        });
    }
    async recordSale(productId, quantity, salePrice) {
        const analytics = await this.getProductAnalytics(productId);
        const product = await this.productRepository.findOne({ where: { uid: productId } });
        if (!analytics || !product)
            return;
        const revenue = quantity * salePrice;
        const updateData = {
            totalUnitsSold: (analytics?.totalUnitsSold || 0) + quantity,
            totalRevenue: (analytics?.totalRevenue || 0) + revenue,
            lastSaleDate: new Date(),
            salesCount: (analytics?.salesCount || 0) + 1,
            averageSellingPrice: analytics?.totalRevenue
                ? (analytics.totalRevenue + revenue) / (analytics.totalUnitsSold + quantity)
                : salePrice
        };
        const salesHistory = analytics?.salesHistory || [];
        salesHistory.push({
            date: new Date(),
            quantity,
            price: salePrice,
            revenue,
            remainingStock: product.stockQuantity - quantity
        });
        updateData.salesHistory = salesHistory;
        if (analytics?.totalPurchaseCost) {
            updateData.profitMargin = ((updateData.totalRevenue - analytics.totalPurchaseCost) / updateData.totalRevenue) * 100;
            updateData.stockTurnoverRate = updateData.totalUnitsSold / (product.stockQuantity || 1);
        }
        await this.productRepository.update(productId, {
            stockQuantity: product.stockQuantity - quantity
        });
        return this.updateProductAnalytics(productId, updateData);
    }
    async recordPurchase(productId, quantity, purchasePrice) {
        const analytics = await this.getProductAnalytics(productId);
        const cost = quantity * purchasePrice;
        const updateData = {
            unitsPurchased: (analytics?.unitsPurchased || 0) + quantity,
            totalPurchaseCost: (analytics?.totalPurchaseCost || 0) + cost,
            lastPurchaseDate: new Date(),
            averagePurchasePrice: analytics?.totalPurchaseCost
                ? (analytics.totalPurchaseCost + cost) / (analytics.unitsPurchased + quantity)
                : purchasePrice
        };
        if (analytics?.totalRevenue) {
            updateData.profitMargin = ((analytics.totalRevenue - (analytics.totalPurchaseCost + cost)) / analytics.totalRevenue) * 100;
        }
        return this.updateProductAnalytics(productId, updateData);
    }
    async recordView(productId) {
        const analytics = await this.getProductAnalytics(productId);
        return this.updateProductAnalytics(productId, {
            viewCount: (analytics?.viewCount || 0) + 1
        });
    }
    async recordCartAdd(productId) {
        const analytics = await this.getProductAnalytics(productId);
        return this.updateProductAnalytics(productId, {
            cartAddCount: (analytics?.cartAddCount || 0) + 1
        });
    }
    async recordWishlist(productId) {
        const analytics = await this.getProductAnalytics(productId);
        return this.updateProductAnalytics(productId, {
            wishlistCount: (analytics?.wishlistCount || 0) + 1
        });
    }
    async updateStockHistory(productId, quantity, type) {
        const analytics = await this.getProductAnalytics(productId);
        const stockHistory = analytics?.stockHistory || [];
        stockHistory.push({
            date: new Date(),
            quantity,
            type,
            balance: type === 'in' ? quantity : -quantity
        });
        return this.updateProductAnalytics(productId, {
            stockHistory
        });
    }
    async calculateProductPerformance(productId) {
        const analytics = await this.getProductAnalytics(productId);
        const product = await this.productRepository.findOne({
            where: { uid: productId }
        });
        if (!analytics || !product)
            return;
        const now = new Date();
        const daysSinceCreation = Math.ceil((now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const updateData = {
            stockTurnoverRate: analytics.totalUnitsSold / (product.stockQuantity || 1),
            daysInInventory: daysSinceCreation > 0 ? Math.ceil(analytics.totalUnitsSold / daysSinceCreation) : 0
        };
        const categoryProducts = await this.productRepository.find({
            where: { category: product.category }
        });
        if (categoryProducts.length > 0) {
            const rankedProducts = categoryProducts.sort((a, b) => {
                const aAnalytics = a.analytics;
                const bAnalytics = b.analytics;
                return (bAnalytics?.totalRevenue || 0) - (aAnalytics?.totalRevenue || 0);
            });
            const rank = rankedProducts.findIndex(p => p.uid === productId) + 1;
            updateData.categoryRank = rank;
        }
        return this.updateProductAnalytics(productId, updateData);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_2.InjectRepository)(product_analytics_entity_1.ProductAnalytics)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository, Object, event_emitter_1.EventEmitter2])
], ProductsService);
//# sourceMappingURL=products.service.js.map