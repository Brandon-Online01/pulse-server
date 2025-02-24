import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductAnalytics } from './entities/product-analytics.entity';
import { ProductAnalyticsDto } from './dto/product-analytics.dto';
export declare class ProductsService {
    private readonly productRepository;
    private readonly analyticsRepository;
    private cacheManager;
    private readonly eventEmitter;
    private readonly CACHE_PREFIX;
    private readonly CACHE_TTL;
    constructor(productRepository: Repository<Product>, analyticsRepository: Repository<ProductAnalytics>, cacheManager: Cache, eventEmitter: EventEmitter2);
    private getCacheKey;
    private invalidateProductCache;
    createProduct(createProductDto: CreateProductDto): Promise<{
        product: Product | null;
        message: string;
    }>;
    updateProduct(ref: number, updateProductDto: UpdateProductDto): Promise<{
        message: string;
    }>;
    deleteProduct(ref: number): Promise<{
        message: string;
    }>;
    restoreProduct(ref: number): Promise<{
        message: string;
    }>;
    products(page?: number, limit?: number): Promise<PaginatedResponse<Product>>;
    getProductByref(ref: number): Promise<{
        product: Product | null;
        message: string;
    }>;
    productsBySearchTerm(searchTerm: string, page?: number, limit?: number): Promise<PaginatedResponse<Product>>;
    updateProductAnalytics(productId: number, data: Partial<ProductAnalyticsDto>): Promise<ProductAnalytics>;
    getProductAnalytics(productId: number): Promise<ProductAnalytics>;
    updatePriceHistory(productId: number, newPrice: number, type: string): Promise<ProductAnalytics>;
    recordSale(productId: number, quantity: number, salePrice: number): Promise<ProductAnalytics>;
    recordPurchase(productId: number, quantity: number, purchasePrice: number): Promise<ProductAnalytics>;
    recordView(productId: number): Promise<ProductAnalytics>;
    recordCartAdd(productId: number): Promise<ProductAnalytics>;
    recordWishlist(productId: number): Promise<ProductAnalytics>;
    updateStockHistory(productId: number, quantity: number, type: 'in' | 'out'): Promise<ProductAnalytics>;
    calculateProductPerformance(productId: number): Promise<ProductAnalytics>;
}
