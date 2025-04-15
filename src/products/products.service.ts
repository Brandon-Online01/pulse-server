import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
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
	private readonly logger = new Logger(ProductsService.name);

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
			keysToDelete.push(this.getCacheKey(product.uid), `${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}stats`);

			// Add category-specific keys
			if (product.category) {
				keysToDelete.push(`${this.CACHE_PREFIX}category_${product.category}`);
			}

			// Add status-specific keys
			if (product.status) {
				keysToDelete.push(`${this.CACHE_PREFIX}status_${product.status}`);
			}

			// Add organization-specific keys
			if (product.organisation?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}org_${product.organisation.uid}`);
			}

			// Add branch-specific keys
			if (product.branch?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}branch_${product.branch.uid}`);
			}

			// Clear all pagination and search caches
			const productListCaches = keys.filter(
				(key) =>
					key.startsWith(`${this.CACHE_PREFIX}page`) ||
					key.startsWith(`${this.CACHE_PREFIX}search`) ||
					key.includes('_limit'),
			);
			keysToDelete.push(...productListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));

			// Emit event for other services that might be caching product data
			this.eventEmitter.emit('products.cache.invalidate', {
				productId: product.uid,
				keys: keysToDelete,
			});
		} catch (error) {
			console.error('Error invalidating product cache:', error);
		}
	}

	async createProduct(
		createProductDto: CreateProductDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ product: Product | null; message: string }> {
		try {
			// Create product with org and branch
			const product = this.productRepository.create({
				...createProductDto,
				...(orgId && { organisation: { uid: orgId } }),
				...(branchId && { branch: { uid: branchId } }),
			});

			const savedProduct = await this.productRepository.save(product);

			// Clear cache
			await this.cacheManager.del(`${this.CACHE_PREFIX}all`);

			// Return the saved product
			return {
				product: savedProduct,
				message: process.env.SUCCESS_MESSAGE || 'Product created successfully',
			};
		} catch (error) {
			return {
				product: null,
				message: error.message || 'Error creating product',
			};
		}
	}

	async updateProduct(ref: number, updateProductDto: UpdateProductDto): Promise<{ message: string }> {
		try {
			// First find the product to ensure it exists
			const product = await this.getProductByref(ref);

			if (!product.product) {
				throw new NotFoundException('Product not found');
			}

			// Check if price is being updated to update price history
			if (updateProductDto.price && updateProductDto.price !== product.product.price) {
				await this.updatePriceHistory(ref, updateProductDto.price, 'update');
			}

			// Check if stock quantity is being updated to update stock history
			if (
				updateProductDto.stockQuantity !== undefined &&
				updateProductDto.stockQuantity !== product.product.stockQuantity
			) {
				const stockChange = updateProductDto.stockQuantity - (product.product.stockQuantity || 0);
				await this.updateStockHistory(ref, Math.abs(stockChange), stockChange > 0 ? 'in' : 'out');
			}

			// Update the product
			await this.productRepository.update(ref, updateProductDto);

			// Invalidate cache
			await this.invalidateProductCache(product.product);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error.message || 'Error updating product',
			};
		}
	}

	async deleteProduct(ref: number): Promise<{ message: string }> {
		try {
			// First find the product to ensure it exists
			const product = await this.getProductByref(ref);

			if (!product.product) {
				throw new NotFoundException('Product not found');
			}

			// Soft delete
			await this.productRepository.update(ref, {
				isDeleted: true,
				status: ProductStatus.INACTIVE,
			});

			// Invalidate cache
			await this.invalidateProductCache(product.product);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error.message || 'Error deleting product',
			};
		}
	}

	async restoreProduct(ref: number): Promise<{ message: string }> {
		try {
			// Find the deleted product
			const product = await this.productRepository.findOne({
				where: { uid: ref, isDeleted: true },
				relations: ['organisation', 'branch'],
			});

			if (!product) {
				throw new NotFoundException('Product not found');
			}

			// Restore the product
			await this.productRepository.update(ref, {
				isDeleted: false,
				status: ProductStatus.ACTIVE,
			});

			// Invalidate cache
			await this.invalidateProductCache(product);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error.message || 'Error restoring product',
			};
		}
	}

	async products(
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
		orgId?: number,
		branchId?: number,
	): Promise<PaginatedResponse<Product>> {
		try {
			const queryBuilder = this.productRepository
				.createQueryBuilder('product')
				.leftJoinAndSelect('product.organisation', 'organisation')
				.leftJoinAndSelect('product.branch', 'branch')
				.where('product.isDeleted = :isDeleted', { isDeleted: false });

			// Filter by organization if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Filter by branch if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			// Add pagination
			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('product.createdAt', 'DESC');

			const [products, total] = await queryBuilder.getManyAndCount();

			if (!products || products.length === 0) {
				return {
					data: [],
					meta: {
						total: 0,
						page,
						limit,
						totalPages: 0,
					},
					message: 'No products found',
				};
			}

			return {
				data: products,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
				message: error.message || 'Error fetching products',
			};
		}
	}

	async getProductByref(ref: number, orgId?: number, branchId?: number): Promise<{ product: Product | null; message: string }> {
		try {
			// Build where conditions
			const whereConditions: any = {
				uid: ref,
				isDeleted: false,
			};

			// Add org filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			const product = await this.productRepository.findOne({
				where: whereConditions,
				relations: ['organisation', 'branch', 'analytics', 'reseller'],
			});

			if (!product) {
				throw new NotFoundException('Product not found');
			}

			return {
				product,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				product: null,
				message: error.message || 'Error fetching product',
			};
		}
	}

	async productsBySearchTerm(
		searchTerm: string,
		page: number = 1,
		limit: number = 10,
		orgId?: number,
		branchId?: number,
	): Promise<PaginatedResponse<Product>> {
		try {
			const queryBuilder = this.productRepository
				.createQueryBuilder('product')
				.leftJoinAndSelect('product.organisation', 'organisation')
				.leftJoinAndSelect('product.branch', 'branch')
				.where('product.isDeleted = :isDeleted', { isDeleted: false });

			// Filter by organization if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Filter by branch if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			// Apply search term - could be category, name, or description
			queryBuilder.andWhere(
				'(LOWER(product.category) LIKE LOWER(:searchTerm) OR LOWER(product.name) LIKE LOWER(:searchTerm) OR LOWER(product.description) LIKE LOWER(:searchTerm) OR LOWER(product.sku) LIKE LOWER(:searchTerm) OR LOWER(product.barcode) LIKE LOWER(:searchTerm))',
				{ searchTerm: `%${searchTerm}%` },
			);

			// Add pagination
			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('product.createdAt', 'DESC');

			const [products, total] = await queryBuilder.getManyAndCount();

			if (!products || products.length === 0) {
				return {
					data: [],
					meta: {
						total: 0,
						page,
						limit,
						totalPages: 0,
					},
					message: 'No products found matching search criteria',
				};
			}

			return {
				data: products,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
				message: error.message || 'Error searching products',
			};
		}
	}

	// Analytics methods don't need org/branch filtering since they operate on products
	// that have already been filtered by the getProductByref method

	async updateProductAnalytics(productId: number, updateData: Partial<ProductAnalyticsDto>) {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			await this.analyticsRepository.update({ productId }, updateData);
			return { message: 'Analytics updated successfully' };
		} catch (error) {
			this.logger.error(`Error updating product analytics: ${error.message}`);
			return { message: error.message || 'Error updating analytics' };
		}
	}

	async getProductAnalytics(productId: number) {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				return { message: 'Analytics not found', analytics: null };
			}
			return { message: 'Success', analytics };
		} catch (error) {
			return { message: error.message || 'Error fetching analytics', analytics: null };
		}
	}

	async updatePriceHistory(productId: number, newPrice: number, type: string) {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			const priceHistory = analytics.priceHistory || [];
			priceHistory.push({
				date: new Date(),
				price: newPrice,
				type,
			});

			await this.analyticsRepository.update({ productId }, { priceHistory });
			return { message: 'Price history updated successfully' };
		} catch (error) {
			return { message: error.message || 'Error updating price history' };
		}
	}

	async recordSale(productId: number, quantity: number, salePrice: number) {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			// Update sales metrics
			const updatedAnalytics = {
				totalUnitsSold: (analytics.totalUnitsSold || 0) + quantity,
				totalRevenue: (analytics.totalRevenue || 0) + quantity * salePrice,
				salesCount: (analytics.salesCount || 0) + 1,
				salesHistory: [
					...(analytics.salesHistory || []),
					{
						date: new Date(),
						quantity,
						price: salePrice,
						total: quantity * salePrice,
					},
				],
			};

			await this.analyticsRepository.update({ productId }, updatedAnalytics);

			// Update stock history
			await this.updateStockHistory(productId, quantity, 'out');

			return { message: 'Sale recorded successfully' };
		} catch (error) {
			return { message: error.message || 'Error recording sale' };
		}
	}

	async recordPurchase(productId: number, quantity: number, purchasePrice: number) {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			// Calculate total purchase cost
			const totalCost = quantity * purchasePrice;

			// Update purchase metrics
			await this.analyticsRepository.update(
				{ productId },
				{
					unitsPurchased: (analytics.unitsPurchased || 0) + quantity,
					totalPurchaseCost: (analytics.totalPurchaseCost || 0) + totalCost,
					lastPurchaseDate: new Date(),
					averagePurchasePrice: analytics.unitsPurchased
						? ((analytics.totalPurchaseCost || 0) + totalCost) /
						  ((analytics.unitsPurchased || 0) + quantity)
						: purchasePrice,
				},
			);

			// Update stock history
			await this.updateStockHistory(productId, quantity, 'in');

			return { message: 'Purchase recorded successfully' };
		} catch (error) {
			return { message: error.message || 'Error recording purchase' };
		}
	}

	async recordView(productId: number) {
		const analytics = await this.analyticsRepository.findOne({ where: { productId } });
		if (analytics) {
			await this.analyticsRepository.update({ productId }, { viewCount: (analytics.viewCount || 0) + 1 });
		}
		return { message: 'View recorded' };
	}

	async recordCartAdd(productId: number) {
		const analytics = await this.analyticsRepository.findOne({ where: { productId } });
		if (analytics) {
			await this.analyticsRepository.update({ productId }, { cartAddCount: (analytics.cartAddCount || 0) + 1 });
		}
		return { message: 'Cart add recorded' };
	}

	async recordWishlist(productId: number) {
		const analytics = await this.analyticsRepository.findOne({ where: { productId } });
		if (analytics) {
			await this.analyticsRepository.update({ productId }, { wishlistCount: (analytics.wishlistCount || 0) + 1 });
		}
		return { message: 'Wishlist add recorded' };
	}

	async updateStockHistory(productId: number, quantity: number, type: 'in' | 'out') {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			const product = await this.productRepository.findOne({ where: { uid: productId } });
			if (!product) {
				throw new NotFoundException('Product not found');
			}

			const stockHistory = analytics.stockHistory || [];
			stockHistory.push({
				date: new Date(),
				quantity,
				type,
				balance: product.stockQuantity,
			});

			await this.analyticsRepository.update({ productId }, { stockHistory });
			return { message: 'Stock history updated successfully' };
		} catch (error) {
			return { message: error.message || 'Error updating stock history' };
		}
	}

	async calculateProductPerformance(productId: number) {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			// Calculate conversion rates
			const viewToCartRate = analytics.viewCount ? (analytics.cartAddCount / analytics.viewCount) * 100 : 0;
			const cartToSaleRate = analytics.cartAddCount ? (analytics.salesCount / analytics.cartAddCount) * 100 : 0;
			const viewToSaleRate = analytics.viewCount ? (analytics.salesCount / analytics.viewCount) * 100 : 0;

			// Calculate average sale value
			const avgSaleValue = analytics.salesCount ? analytics.totalRevenue / analytics.salesCount : 0;

			// Calculate profit margin if cost data is available
			const profitMargin =
				analytics.totalPurchaseCost && analytics.totalRevenue
					? ((analytics.totalRevenue - analytics.totalPurchaseCost) / analytics.totalRevenue) * 100
					: null;

			// Update the performance metrics
			await this.analyticsRepository.update(
				{ productId },
				{
					profitMargin: profitMargin ? parseFloat(profitMargin.toFixed(2)) : null,
					stockTurnoverRate: parseFloat(
						(analytics.totalUnitsSold / (analytics.unitsPurchased || 1)).toFixed(2),
					),
				},
			);

			const performance = {
				viewToCartRate: parseFloat(viewToCartRate.toFixed(2)),
				cartToSaleRate: parseFloat(cartToSaleRate.toFixed(2)),
				viewToSaleRate: parseFloat(viewToSaleRate.toFixed(2)),
				avgSaleValue: parseFloat(avgSaleValue.toFixed(2)),
				totalRevenue: analytics.totalRevenue,
				totalUnitsSold: analytics.totalUnitsSold,
				salesCount: analytics.salesCount,
				viewCount: analytics.viewCount,
				cartAddCount: analytics.cartAddCount,
				wishlistCount: analytics.wishlistCount,
				profitMargin: profitMargin ? parseFloat(profitMargin.toFixed(2)) : null,
			};

			return {
				message: 'Performance calculated successfully',
				performance,
			};
		} catch (error) {
			return {
				message: error.message || 'Error calculating performance',
				performance: null,
			};
		}
	}

	async isStockAvailable(productId: number, quantity: number): Promise<boolean> {
		try {
			const product = await this.getProductByref(productId);
			return product && product.product.stockQuantity >= quantity;
		} catch (error) {
			this.logger.error(`Error checking stock availability: ${error.message}`);
			return false;
		}
	}

	async updateStock(productId: number, quantityChange: number): Promise<void> {
		try {
			const product = await this.getProductByref(productId);
			if (!product.product) {
				throw new NotFoundException(`Product with ID ${productId} not found`);
			}

			const newStock = Math.max(0, product.product.stockQuantity + quantityChange);
			await this.productRepository.update(productId, { stockQuantity: newStock });

			// Update stock history
			await this.updateStockHistory(productId, Math.abs(quantityChange), quantityChange > 0 ? 'in' : 'out');
		} catch (error) {
			this.logger.error(`Error updating stock: ${error.message}`);
			throw error;
		}
	}

	async recordQuotationCreation(productId: number): Promise<void> {
		try {
			const analytics = await this.analyticsRepository.findOne({ where: { productId } });
			if (!analytics) {
				throw new NotFoundException('Product analytics not found');
			}

			await this.analyticsRepository.update(
				{ productId },
				{ quotationCount: (analytics.quotationCount || 0) + 1 },
			);
		} catch (error) {
			this.logger.error(`Error recording quotation creation: ${error.message}`);
			// Don't throw, just log the error
		}
	}
}
