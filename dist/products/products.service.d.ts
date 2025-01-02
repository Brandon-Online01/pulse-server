import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
export declare class ProductsService {
    private productRepository;
    private cacheManager;
    constructor(productRepository: Repository<Product>, cacheManager: Cache);
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
}
