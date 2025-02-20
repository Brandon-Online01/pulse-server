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

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
	) { }

	private async invalidateProductCaches(): Promise<void> {
		const keys = await this.cacheManager.store.keys();
		const productKeys = keys.filter(key => 
			key.startsWith('products_') || 
			key.startsWith('search_') || 
			key === 'all_products'
		);
		await Promise.all(productKeys.map(key => this.cacheManager.del(key)));
	}

	async createProduct(createProductDto: CreateProductDto): Promise<{ product: Product | null, message: string }> {
		try {
			const product = await this.productRepository.save(createProductDto);

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.invalidateProductCaches();

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
			const product = await this.productRepository.update(ref, updateProductDto);

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.invalidateProductCaches();

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
			const product = await this.productRepository.update(ref, { isDeleted: true });

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.invalidateProductCaches();

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
			const product = await this.productRepository.update(ref, { isDeleted: false });

			if (!product) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.invalidateProductCaches();

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