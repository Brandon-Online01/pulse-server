import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository, In, Not, Like } from 'typeorm';
import { ProductStatus } from '../lib/enums/product.enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductsService {
	private readonly CACHE_PREFIX = 'products:';
	private readonly CACHE_TTL: number;

	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly eventEmitter: EventEmitter2,
	) {
		this.CACHE_TTL = Number(process.env.CACHE_EXPIRATION_TIME) || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async invalidateProductCache(product: Product) {
		try {
			// Get all cache keys
			const keys = await this.cacheManager.store.keys();
			
			// Keys to clear
			const keysToDelete = [];

			// Add product-specific keys
			keysToDelete.push(
				this.getCacheKey(product.uid),
				`${this.CACHE_PREFIX}all`,
				`${this.CACHE_PREFIX}stats`
			);

			// Add category-specific keys
			if (product.category) {
				keysToDelete.push(`${this.CACHE_PREFIX}category_${product.category}`);
			}

			// Add status-specific keys
			if (product.status) {
				keysToDelete.push(`${this.CACHE_PREFIX}status_${product.status}`);
			}

			// Clear all pagination and search caches
			const productListCaches = keys.filter(key => 
				key.startsWith(`${this.CACHE_PREFIX}page`) || 
				key.startsWith(`${this.CACHE_PREFIX}search`) ||
				key.includes('_limit')
			);
			keysToDelete.push(...productListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map(key => this.cacheManager.del(key)));

			// Emit event for other services that might be caching product data
			this.eventEmitter.emit('products.cache.invalidate', {
				productId: product.uid,
				keys: keysToDelete
			});
		} catch (error) {
			console.error('Error invalidating product cache:', error);
		}
	}

	async createProduct(createProductDto: CreateProductDto): Promise<{ product: Product | null, message: string }> {
		try {
			const product = await this.productRepository.save(createProductDto);

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Invalidate cache after creation
			await this.invalidateProductCache(product);

			const response = {
				product: product,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				product: null
			}

			return response;
		}
	}

	async updateProduct(ref: number, updateProductDto: UpdateProductDto): Promise<{ message: string }> {
		try {
			const existingProduct = await this.productRepository.findOne({
				where: { uid: ref }
			});

			if (!existingProduct) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.productRepository.update(ref, updateProductDto);

			// Invalidate cache after update using the existing product
			await this.invalidateProductCache(existingProduct);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async deleteProduct(ref: number): Promise<{ message: string }> {
		try {
			const product = await this.productRepository.findOne({
				where: { uid: ref }
			});

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.productRepository.update(ref, { isDeleted: true });

			// Invalidate cache after deletion
			await this.invalidateProductCache(product);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async restoreProduct(ref: number): Promise<{ message: string }> {
		try {
			const product = await this.productRepository.findOne({
				where: { uid: ref }
			});

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.productRepository.update(ref, { isDeleted: false });

			// Invalidate cache after restoration
			await this.invalidateProductCache(product);

			const response = {
				message: process.env.SUCCESS_MESSAGE
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async products(
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT)
	): Promise<PaginatedResponse<Product>> {
		try {
			const cacheKey = `products_page${page}_limit${limit}`;
			const cachedProducts = await this.cacheManager.get<PaginatedResponse<Product>>(cacheKey);

			if (cachedProducts) {
				return cachedProducts;
			}

			const [products, total] = await this.productRepository.findAndCount({
				where: {
					status: Not(In([ProductStatus.DISCONTINUED, ProductStatus.HIDDEN, ProductStatus.DELETED])),
					isDeleted: false
				},
				skip: (page - 1) * limit,
				take: limit,
				order: {
					createdAt: 'DESC'
				}
			});

			if (!products) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
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
		} catch (error) {
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

	async getProductByref(ref: number): Promise<{ product: Product | null, message: string }> {
		try {
			const product = await this.productRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false
				}
			});

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				product: product,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				product: null
			}

			return response;
		}
	}

	async productsBySearchTerm(
		searchTerm: string,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResponse<Product>> {
		try {
			const cacheKey = `search_${searchTerm?.toLowerCase()}_page${page}_limit${limit}`;
			const cachedResults = await this.cacheManager.get<PaginatedResponse<Product>>(cacheKey);

			if (cachedResults) {
				return cachedResults;
			}

			const searchPattern = `%${searchTerm?.toLowerCase()}%`;
			const [products, total] = await this.productRepository.findAndCount({
				where: [
					{ category: Like(searchPattern), isDeleted: false },
					{ status: Like(searchTerm?.toLowerCase() as ProductStatus), isDeleted: false }
				],
				skip: (page - 1) * limit,
				take: limit,
				order: {
					createdAt: 'DESC'
				}
			});

			if (!products) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
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
		} catch (error) {
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
}