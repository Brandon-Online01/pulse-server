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
import { ProductAnalytics } from './entities/product-analytics.entity';
import { ProductAnalyticsDto } from './dto/product-analytics.dto';

@Injectable()
export class ProductsService {
	private readonly CACHE_PREFIX = 'products:';
	private readonly CACHE_TTL: number;

	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		@InjectRepository(ProductAnalytics)
		private readonly analyticsRepository: Repository<ProductAnalytics>,
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

			// Initialize analytics with more detailed initial state
			await this.analyticsRepository.save(
				this.analyticsRepository.create({
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
				})
			);

			await this.invalidateProductCache(product);

			return {
				product: product,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				product: null
			}
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

			// Track price changes in analytics
			if (updateProductDto.price && updateProductDto.price !== existingProduct.price) {
				await this.updatePriceHistory(ref, Number(updateProductDto.price), 'update');
			}

			// Track stock changes in analytics
			if (updateProductDto.stockQuantity && updateProductDto.stockQuantity !== existingProduct.stockQuantity) {
				const difference = updateProductDto.stockQuantity - existingProduct.stockQuantity;
				await this.updateStockHistory(ref, Math.abs(difference), difference > 0 ? 'in' : 'out');
			}

			await this.productRepository.update(ref, updateProductDto);
			await this.invalidateProductCache(existingProduct);

			// Recalculate performance metrics after update
			await this.calculateProductPerformance(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			}
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

	async updateProductAnalytics(productId: number, data: Partial<ProductAnalyticsDto>) {
		let analytics = await this.analyticsRepository.findOne({
			where: { productId }
		});

		if (!analytics) {
			analytics = this.analyticsRepository.create({
				productId,
				...data
			});
		} else {
			this.analyticsRepository.merge(analytics, data);
		}

		return this.analyticsRepository.save(analytics);
	}

	async getProductAnalytics(productId: number) {
		return this.analyticsRepository.findOne({
			where: { productId }
		});
	}

	async updatePriceHistory(productId: number, newPrice: number, type: string) {
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

	async recordSale(productId: number, quantity: number, salePrice: number) {
		const analytics = await this.getProductAnalytics(productId);
		const product = await this.productRepository.findOne({ where: { uid: productId } });
		
		if (!analytics || !product) return;

		const revenue = quantity * salePrice;

		const updateData: Partial<ProductAnalyticsDto> = {
			totalUnitsSold: (analytics?.totalUnitsSold || 0) + quantity,
			totalRevenue: (analytics?.totalRevenue || 0) + revenue,
			lastSaleDate: new Date(),
			salesCount: (analytics?.salesCount || 0) + 1,
			averageSellingPrice: analytics?.totalRevenue 
				? (analytics.totalRevenue + revenue) / (analytics.totalUnitsSold + quantity)
				: salePrice
		};

		// Update sales history
		const salesHistory = analytics?.salesHistory || [];
		salesHistory.push({
			date: new Date(),
			quantity,
			price: salePrice,
			revenue,
			remainingStock: product.stockQuantity - quantity
		});

		updateData.salesHistory = salesHistory;

		// Calculate performance metrics
		if (analytics?.totalPurchaseCost) {
			updateData.profitMargin = ((updateData.totalRevenue - analytics.totalPurchaseCost) / updateData.totalRevenue) * 100;
			updateData.stockTurnoverRate = updateData.totalUnitsSold / (product.stockQuantity || 1);
		}

		// Update stock quantity in product
		await this.productRepository.update(productId, {
			stockQuantity: product.stockQuantity - quantity
		});

		return this.updateProductAnalytics(productId, updateData);
	}

	async recordPurchase(productId: number, quantity: number, purchasePrice: number) {
		const analytics = await this.getProductAnalytics(productId);
		const cost = quantity * purchasePrice;

		const updateData: Partial<ProductAnalyticsDto> = {
			unitsPurchased: (analytics?.unitsPurchased || 0) + quantity,
			totalPurchaseCost: (analytics?.totalPurchaseCost || 0) + cost,
			lastPurchaseDate: new Date(),
			averagePurchasePrice: analytics?.totalPurchaseCost 
				? (analytics.totalPurchaseCost + cost) / (analytics.unitsPurchased + quantity)
				: purchasePrice
		};

		// Update performance metrics
		if (analytics?.totalRevenue) {
			updateData.profitMargin = ((analytics.totalRevenue - (analytics.totalPurchaseCost + cost)) / analytics.totalRevenue) * 100;
		}

		return this.updateProductAnalytics(productId, updateData);
	}

	async recordView(productId: number) {
		const analytics = await this.getProductAnalytics(productId);
		return this.updateProductAnalytics(productId, {
			viewCount: (analytics?.viewCount || 0) + 1
		});
	}

	async recordCartAdd(productId: number) {
		const analytics = await this.getProductAnalytics(productId);
		return this.updateProductAnalytics(productId, {
			cartAddCount: (analytics?.cartAddCount || 0) + 1
		});
	}

	async recordWishlist(productId: number) {
		const analytics = await this.getProductAnalytics(productId);
		return this.updateProductAnalytics(productId, {
			wishlistCount: (analytics?.wishlistCount || 0) + 1
		});
	}

	async updateStockHistory(productId: number, quantity: number, type: 'in' | 'out') {
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

	async calculateProductPerformance(productId: number) {
		const analytics = await this.getProductAnalytics(productId);
		const product = await this.productRepository.findOne({
			where: { uid: productId }
		});

		if (!analytics || !product) return;

		const now = new Date();
		const daysSinceCreation = Math.ceil((now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24));

		// Calculate more detailed performance metrics
		const updateData: Partial<ProductAnalyticsDto> = {
			stockTurnoverRate: analytics.totalUnitsSold / (product.stockQuantity || 1),
			daysInInventory: daysSinceCreation > 0 ? Math.ceil(analytics.totalUnitsSold / daysSinceCreation) : 0
		};

		// Calculate category rank if possible
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
}