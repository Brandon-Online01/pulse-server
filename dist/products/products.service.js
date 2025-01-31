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
let ProductsService = class ProductsService {
    constructor(productRepository, cacheManager) {
        this.productRepository = productRepository;
        this.cacheManager = cacheManager;
    }
    async createProduct(createProductDto) {
        try {
            const product = await this.productRepository.save(createProductDto);
            await this.cacheManager.del('all_products');
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.productRepository.save(product);
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
    async updateProduct(ref, updateProductDto) {
        try {
            const product = await this.productRepository.update(ref, updateProductDto);
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.del('all_products');
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
    async deleteProduct(ref) {
        try {
            const product = await this.productRepository.update(ref, { isDeleted: true });
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.del('all_products');
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
            const product = await this.productRepository.update(ref, { isDeleted: false });
            if (!product) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.del('all_products');
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
                    status: (0, typeorm_1.Not)((0, typeorm_1.In)([product_enums_1.ProductStatus.DISCONTINUED, product_enums_1.ProductStatus.HIDDEN]))
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
                    uid: ref
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
                    { category: (0, typeorm_1.Like)(searchPattern) },
                    { status: (0, typeorm_1.Like)(searchTerm?.toLowerCase()) }
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map