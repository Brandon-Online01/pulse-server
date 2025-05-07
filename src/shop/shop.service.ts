import { Repository } from 'typeorm';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Quotation } from './entities/quotation.entity';
import { Banners } from './entities/banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ProductStatus } from '../lib/enums/product.enums';
import { Product } from '../products/entities/product.entity';
import { startOfDay, endOfDay } from 'date-fns';
import { OrderStatus } from '../lib/enums/status.enums';
import { ConfigService } from '@nestjs/config';
import { EmailType } from '../lib/enums/email.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientsService } from '../clients/clients.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ShopGateway } from './shop.gateway';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { ProductsService } from '../products/products.service';
import { OrganisationService } from '../organisation/organisation.service';
import { QuotationInternalData } from '../lib/types/email-templates.types';

@Injectable()
export class ShopService {
	private readonly currencyLocale: string;
	private currencyCode: string;
	private currencySymbol: string;
	private readonly logger = new Logger(ShopService.name);
	private currencyByOrg: Map<number, { code: string; symbol: string; locale: string }> = new Map();

	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@InjectRepository(Quotation)
		private quotationRepository: Repository<Quotation>,
		@InjectRepository(Banners)
		private bannersRepository: Repository<Banners>,
		private readonly configService: ConfigService,
		private readonly clientsService: ClientsService,
		private readonly eventEmitter: EventEmitter2,
		private readonly shopGateway: ShopGateway,
		private readonly productsService: ProductsService,
		private readonly organisationService: OrganisationService,
	) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
	}

	/**
	 * Fetches and caches the currency settings for a specific organization
	 * @param orgId The organization ID to fetch settings for
	 * @returns Object containing the currency code, symbol, and locale
	 */
	private async getOrgCurrency(orgId: number): Promise<{ code: string; symbol: string; locale: string }> {
		// Return defaults if no orgId provided
		if (!orgId) {
			return {
				code: this.currencyCode,
				symbol: this.currencySymbol,
				locale: this.currencyLocale,
			};
		}

		// Return from cache if available
		if (this.currencyByOrg.has(orgId)) {
			return this.currencyByOrg.get(orgId);
		}

		try {
			// Fetch organization with settings relation
			const orgIdStr = String(orgId);
			const { organisation } = await this.organisationService.findOne(orgIdStr);

			// Handle missing organization or settings gracefully
			if (!organisation || !organisation.settings || !organisation.settings.regional) {
				this.logger.warn(`Organization ${orgId} settings not found, using defaults`);
				return {
					code: this.currencyCode,
					symbol: this.currencySymbol,
					locale: this.currencyLocale,
				};
			}

			// Extract currency from org settings with fallback
			const orgCurrency = organisation.settings.regional.currency;
			if (!orgCurrency) {
				this.logger.warn(`Currency not set for organization ${orgId}, using defaults`);
				return {
					code: this.currencyCode,
					symbol: this.currencySymbol,
					locale: this.currencyLocale,
				};
			}

			// Map currency to appropriate symbol and locale (add more as needed)
			const currencyMap = {
				USD: { symbol: '$', locale: 'en-US' },
				EUR: { symbol: '€', locale: 'en-EU' },
				GBP: { symbol: '£', locale: 'en-GB' },
				ZAR: { symbol: 'R', locale: 'en-ZA' },
				// Add more currencies as needed
			};

			// Get currency details or use defaults
			const currencyDetails = currencyMap[orgCurrency] || {
				symbol: this.currencySymbol,
				locale: this.currencyLocale,
			};

			const result = {
				code: orgCurrency,
				symbol: currencyDetails.symbol,
				locale: currencyDetails.locale,
			};

			// Cache the result
			this.currencyByOrg.set(orgId, result);

			return result;
		} catch (error) {
			this.logger.warn(`Error fetching organization currency: ${error.message}, using defaults`);

			// Return defaults on error
			return {
				code: this.currencyCode,
				symbol: this.currencySymbol,
				locale: this.currencyLocale,
			};
		}
	}

	// Original method - keep for backward compatibility
	private formatCurrency(amount: number): string {
		return new Intl.NumberFormat(this.currencyLocale, {
			style: 'currency',
			currency: this.currencyCode,
		})
			.format(amount)
			.replace(this.currencyCode, this.currencySymbol);
	}

	async categories(orgId?: number, branchId?: number): Promise<{ categories: string[] | null; message: string }> {
		try {
			// Build query with optional org and branch filters
			const query = this.productRepository.createQueryBuilder('product');

			// Only add filters if values are provided
			if (orgId) {
				query.andWhere('product.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('product.branchUid = :branchId', { branchId });
			}

			const allProducts = await query.getMany();

			// Return empty categories array if no products found instead of throwing error
			if (!allProducts || allProducts?.length === 0) {
				return {
					categories: [],
					message: 'No products found',
				};
			}

			const categories = allProducts.map((product) => product?.category);
			const uniqueCategories = [...new Set(categories)].filter(Boolean); // Filter out null/undefined values

			const response = {
				categories: uniqueCategories,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			// Log error but return empty categories instead of null
			this.logger.warn(`Error fetching categories: ${error?.message}`);

			const response = {
				message: error?.message || 'Error fetching categories',
				categories: [],
			};

			return response;
		}
	}

	private async getProductsByStatus(
		status: ProductStatus,
		orgId?: number,
		branchId?: number,
	): Promise<{ products: Product[] | null }> {
		try {
			// Build query with orgId and branchId as optional filters
			const query = this.productRepository
				.createQueryBuilder('product')
				.where('product.status = :status', { status });

			// Only add org filter if orgId is provided
			if (orgId) {
				query.andWhere('product.organisationUid = :orgId', { orgId });
			}

			// Only add branch filter if branchId is provided
			if (branchId) {
				query.andWhere('product.branchUid = :branchId', { branchId });
			}

			const products = await query.getMany();

			return { products: products ?? [] }; // Return empty array instead of null if no products
		} catch (error) {
			this.logger.warn(`Error fetching products by status: ${error?.message}`);
			return { products: [] }; // Return empty array on error
		}
	}

	async specials(orgId?: number, branchId?: number): Promise<{ products: Product[] | null; message: string }> {
		const result = await this.getProductsByStatus(ProductStatus.SPECIAL, orgId, branchId);

		const response = {
			products: result?.products,
			message: process.env.SUCCESS_MESSAGE,
		};

		return response;
	}

	async getBestSellers(orgId?: number, branchId?: number): Promise<{ products: Product[] | null; message: string }> {
		const result = await this.getProductsByStatus(ProductStatus.BEST_SELLER, orgId, branchId);

		const response = {
			products: result.products,
			message: process.env.SUCCESS_MESSAGE,
		};

		return response;
	}

	async getNewArrivals(orgId?: number, branchId?: number): Promise<{ products: Product[] | null; message: string }> {
		const result = await this.getProductsByStatus(ProductStatus.NEW, orgId, branchId);

		const response = {
			products: result.products,
			message: process.env.SUCCESS_MESSAGE,
		};

		return response;
	}

	async getHotDeals(orgId?: number, branchId?: number): Promise<{ products: Product[] | null; message: string }> {
		const result = await this.getProductsByStatus(ProductStatus.HOTDEALS, orgId, branchId);

		const response = {
			products: result.products,
			message: process.env.SUCCESS_MESSAGE,
		};

		return response;
	}

	async createQuotation(quotationData: CheckoutDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!quotationData?.items?.length) {
				throw new Error('Quotation items are required');
			}

			if (!quotationData?.owner?.uid) {
				throw new Error('Owner is required');
			}

			if (!quotationData?.client?.uid) {
				throw new Error('Client is required');
			}

			// Get organization-specific currency settings
			const orgCurrency = await this.getOrgCurrency(orgId);

			const clientData = await this.clientsService?.findOne(Number(quotationData?.client?.uid));

			if (!clientData) {
				throw new NotFoundException(process.env.CLIENT_NOT_FOUND_MESSAGE);
			}

			const { name: clientName } = clientData?.client;
			const internalEmail = this.configService.get<string>('INTERNAL_BROADCAST_EMAIL');

			const productPromises = quotationData?.items?.map((item) =>
				this.productRepository.find({ where: { uid: item?.uid }, relations: ['reseller'] }),
			);

			const products = await Promise.all(productPromises);

			const resellerEmails = products
				.flat()
				.map((product) => ({
					email: product?.reseller?.email,
					retailerName: product?.reseller?.name,
				}))
				.filter((email) => email?.email)
				.reduce((unique, item) => {
					return unique?.some((u) => u?.email === item?.email) ? unique : [...unique, item];
				}, []);

			// Create a map of product UIDs to their references
			const productRefs = new Map(products.flat().map((product) => [product.uid, product.productRef]));

			// Validate that all products were found
			const missingProducts = quotationData?.items?.filter((item) => !productRefs.has(item.uid));

			if (missingProducts?.length > 0) {
				throw new Error(`Products not found for items: ${missingProducts.map((item) => item.uid).join(', ')}`);
			}

			// Generate a unique review token for the quotation
			const timestamp = Date.now();
			const reviewToken = Buffer.from(
				`${quotationData?.client?.uid}-${timestamp}-${Math.random().toString(36).substring(2, 15)}`,
			).toString('base64');
			const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://loro.co.za/review-quotation';
			const reviewUrl = `${frontendUrl}?token=${reviewToken}`;

			const newQuotation = {
				quotationNumber: `QUO-${Date.now()}`,
				totalItems: Number(quotationData?.totalItems),
				totalAmount: Number(quotationData?.totalAmount),
				placedBy: { uid: quotationData?.owner?.uid },
				client: { uid: quotationData?.client?.uid },
				status: OrderStatus.DRAFT,
				quotationDate: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
				reviewToken: reviewToken,
				reviewUrl: reviewUrl,
				promoCode: quotationData?.promoCode,
				// Store currency code with the quotation
				currency: orgCurrency.code,
				quotationItems: quotationData?.items?.map((item) => {
					const product = products.flat().find((p) => p.uid === item.uid);
					return {
						quantity: Number(item?.quantity),
						product: {
							uid: item?.uid,
							name: product?.name,
							sku: product?.sku,
							productRef: product?.productRef,
							price: product?.price,
						},
						unitPrice: Number(product?.price || 0),
						totalPrice: Number(item?.totalPrice),
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				}),
				// Assign organisation and branch as relation objects if IDs exist
				...(orgId && { organisation: { uid: orgId } }), // Assumes relation name is 'organisation' and expects { uid: ... }
				...(branchId && { branch: { uid: branchId } }),
			};

			// Add organization and branch if available - DIRECT COLUMN VALUES
			if (orgId) {
				// Store as direct column value instead of relation to ensure it's saved properly
				newQuotation['organisationUid'] = orgId;
			}

			if (branchId) {
				// Store as direct column value instead of relation to ensure it's saved properly
				newQuotation['branchUid'] = branchId;
			}

			const savedQuotation = await this.quotationRepository.save(newQuotation);

			console.log('savedQuotation with promo code', savedQuotation);

			// Update analytics for each product
			for (const item of quotationData.items) {
				const product = products.flat().find((p) => p.uid === item.uid);
				if (product) {
					// Record view and cart add
					await this.productsService.recordView(product.uid);
					await this.productsService.recordCartAdd(product.uid);

					// Update stock history
					await this.productsService.updateStockHistory(product.uid, item.quantity, 'out');

					// Calculate updated performance metrics
					await this.productsService.calculateProductPerformance(product.uid);
				}
			}

			// Emit WebSocket event for new quotation
			this.shopGateway.emitNewQuotation(savedQuotation?.quotationNumber);

			const baseConfig: QuotationInternalData = {
				name: clientName,
				quotationId: savedQuotation?.quotationNumber,
				validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days validity
				total: Number(savedQuotation?.totalAmount),
				currency: orgCurrency.code, // Use organization's currency code
				reviewUrl: savedQuotation.reviewUrl,
				customerType: clientData?.client?.type || 'standard', // Assuming client type exists, add a fallback
				priority: 'high', // Add default priority for internal notification
				quotationItems: quotationData?.items?.map((item) => {
					const product = products.flat().find((p) => p.uid === item.uid);
					return {
						quantity: Number(item?.quantity),
						product: {
							uid: item?.uid,
							name: product?.name || 'Unknown Product',
							code: product?.productRef || 'N/A',
						},
						totalPrice: Number(item?.totalPrice),
					};
				}),
			};

			// Only send internal notification and order acknowledgment to client
			// Do NOT send the full quotation to the client yet

			// Notify internal team about new quotation
			this.eventEmitter.emit('send.email', EmailType.NEW_QUOTATION_INTERNAL, [internalEmail], baseConfig);

			// Notify resellers about products in the quotation
			resellerEmails?.forEach((email) => {
				this.eventEmitter.emit('send.email', EmailType.NEW_QUOTATION_RESELLER, [email?.email], {
					...baseConfig,
					name: email?.retailerName,
					email: email?.email,
				});
			});

			// Send order acknowledgment to client (NOT the full quotation)
			this.eventEmitter.emit('send.email', EmailType.ORDER_RECEIVED_CLIENT, [clientData?.client?.email], {
				name: clientName,
				quotationId: savedQuotation?.quotationNumber,
				// Don't include detailed information yet
				message: 'We have received your order request and will prepare a quotation for you shortly.',
			});

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			this.logger.error(`Error creating quotation: ${error.message}`, error.stack);
			return {
				message: error?.message,
			};
		}
	}

	async createBanner(
		bannerData: CreateBannerDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ banner: Banners | null; message: string }> {
		try {
			// Create the banner with the correct field names for organization and branch
			const bannerToSave = {
				...bannerData,
			};

			// Only add organization and branch if they exist
			if (orgId) {
				bannerToSave['organisationUid'] = orgId;
			}

			if (branchId) {
				bannerToSave['branchUid'] = branchId;
			}

			const banner = await this.bannersRepository.save(bannerToSave);

			return {
				banner,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				banner: null,
				message: error?.message,
			};
		}
	}

	async getBanner(orgId?: number, branchId?: number): Promise<{ banners: Banners[]; message: string }> {
		try {
			const query = this.bannersRepository.createQueryBuilder('banner');

			if (orgId) {
				query.andWhere('banner.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('banner.branchUid = :branchId', { branchId });
			}

			const banners = await query.getMany();

			return {
				banners,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				banners: [],
				message: error?.message,
			};
		}
	}

	async updateBanner(
		uid: number,
		bannerData: UpdateBannerDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ banner: Banners | null; message: string }> {
		try {
			// Find the banner first to apply filters
			const query = this.bannersRepository.createQueryBuilder('banner').where('banner.uid = :uid', { uid });

			if (orgId) {
				query.andWhere('banner.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('banner.branchUid = :branchId', { branchId });
			}

			const banner = await query.getOne();

			if (!banner) {
				throw new NotFoundException('Banner not found');
			}

			// Update the banner
			await this.bannersRepository.update(uid, bannerData);

			// Get the updated banner
			const updatedBanner = await this.bannersRepository.findOne({
				where: { uid },
			});

			return {
				banner: updatedBanner,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				banner: null,
				message: error?.message,
			};
		}
	}

	async deleteBanner(uid: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Find the banner first to apply filters
			const query = this.bannersRepository.createQueryBuilder('banner').where('banner.uid = :uid', { uid });

			if (orgId) {
				query.andWhere('banner.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('banner.branchUid = :branchId', { branchId });
			}

			const banner = await query.getOne();

			if (!banner) {
				throw new NotFoundException('Banner not found');
			}

			// Delete the banner
			await this.bannersRepository.delete(uid);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async getAllQuotations(orgId?: number, branchId?: number): Promise<{ quotations: Quotation[]; message: string }> {
		try {
			const query = this.quotationRepository
				.createQueryBuilder('quotation')
				.leftJoinAndSelect('quotation.client', 'client')
				.leftJoinAndSelect('quotation.placedBy', 'placedBy')
				.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
				.leftJoinAndSelect('quotationItems.product', 'product')
				.orderBy('quotation.createdAt', 'DESC');

			// Add filtering by org and branch
			if (orgId) {
				query.andWhere('quotation.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('quotation.branchUid = :branchId', { branchId });
			}

			const quotations = await query.getMany();

			return {
				quotations,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				quotations: [],
				message: error?.message,
			};
		}
	}

	async getQuotationsByUser(
		ref: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ quotations: Quotation[]; message: string }> {
		try {
			const query = this.quotationRepository
				.createQueryBuilder('quotation')
				.leftJoinAndSelect('quotation.client', 'client')
				.leftJoinAndSelect('quotation.placedBy', 'placedBy')
				.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
				.leftJoinAndSelect('quotationItems.product', 'product')
				.where('placedBy.uid = :ref', { ref });

			// Add filtering by org and branch
			if (orgId) {
				query.andWhere('quotation.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('quotation.branchUid = :branchId', { branchId });
			}

			const quotations = await query.getMany();

			if (!quotations?.length) {
				throw new NotFoundException(process.env.QUOTATION_NOT_FOUND_MESSAGE);
			}

			return {
				quotations,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				quotations: [],
				message: error?.message,
			};
		}
	}

	async getQuotationByRef(
		ref: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ quotation: Quotation; message: string }> {
		try {
			const query = this.quotationRepository
				.createQueryBuilder('quotation')
				.leftJoinAndSelect('quotation.client', 'client')
				.leftJoinAndSelect('quotation.placedBy', 'placedBy')
				.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
				.leftJoinAndSelect('quotationItems.product', 'product')
				.where('quotation.uid = :ref', { ref });

			// Add filtering by org and branch
			if (orgId) {
				query.andWhere('quotation.organisationUid = :orgId', { orgId });
			}

			if (branchId) {
				query.andWhere('quotation.branchUid = :branchId', { branchId });
			}

			const quotation = await query.getOne();

			if (!quotation) {
				throw new NotFoundException(process.env.QUOTATION_NOT_FOUND_MESSAGE);
			}

			return {
				quotation,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				quotation: null,
				message: error?.message,
			};
		}
	}

	async getQuotationsForDate(
		date: Date,
		orgId?: number,
		branchId?: number,
	): Promise<{
		message: string;
		stats: {
			quotations: {
				pending: Quotation[];
				processing: Quotation[];
				completed: Quotation[];
				cancelled: Quotation[];
				postponed: Quotation[];
				rejected: Quotation[];
				approved: Quotation[];
				metrics: {
					totalQuotations: number;
					grossQuotationValue: string;
					averageQuotationValue: string;
				};
			};
		};
	}> {
		try {
			const queryBuilder = this.quotationRepository
				.createQueryBuilder('quotation')
				.where('quotation.createdAt BETWEEN :startDate AND :endDate', {
					startDate: startOfDay(date),
					endDate: endOfDay(date),
				})
				.leftJoinAndSelect('quotation.quotationItems', 'quotationItems');

			if (orgId) {
				queryBuilder
					.leftJoinAndSelect('quotation.organisation', 'organisation')
					.andWhere('organisation.uid = :orgId', { orgId });
			}

			if (branchId) {
				queryBuilder
					.leftJoinAndSelect('quotation.branch', 'branch')
					.andWhere('branch.uid = :branchId', { branchId });
			}

			const quotations = await queryBuilder.getMany();

			if (!quotations) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			// Group quotations by status
			const groupedQuotations = {
				pending: quotations.filter((quotation) => quotation?.status === OrderStatus.PENDING),
				processing: quotations.filter((quotation) => quotation?.status === OrderStatus.INPROGRESS),
				completed: quotations.filter((quotation) => quotation?.status === OrderStatus.COMPLETED),
				cancelled: quotations.filter((quotation) => quotation?.status === OrderStatus.CANCELLED),
				postponed: quotations.filter((quotation) => quotation?.status === OrderStatus.POSTPONED),
				rejected: quotations.filter((quotation) => quotation?.status === OrderStatus.REJECTED),
				approved: quotations.filter((quotation) => quotation?.status === OrderStatus.APPROVED),
			};

			// Calculate metrics with formatted currency
			const metrics = {
				totalQuotations: quotations?.length,
				grossQuotationValue: this.formatCurrency(
					quotations?.reduce((sum, quotation) => sum + (Number(quotation?.totalAmount) || 0), 0),
				),
				averageQuotationValue: this.formatCurrency(
					quotations?.length > 0
						? quotations?.reduce((sum, quotation) => sum + (Number(quotation?.totalAmount) || 0), 0) /
								quotations?.length
						: 0,
				),
			};

			return {
				message: process.env.SUCCESS_MESSAGE,
				stats: {
					quotations: {
						...groupedQuotations,
						metrics,
					},
				},
			};
		} catch (error) {
			return {
				message: error?.message,
				stats: null,
			};
		}
	}

	private async ensureUniqueSKU(product: Product): Promise<string> {
		let sku = Product.generateSKU(product.category, product.name, product.uid, product.reseller);
		let counter = 1;

		while (await this.productRepository.findOne({ where: { sku } })) {
			sku = `${Product.generateSKU(product.category, product.name, product.uid, product.reseller)}-${counter}`;
			counter++;
		}

		return sku;
	}

	async createProduct(productData: CreateProductDto): Promise<Product> {
		let product = this.productRepository.create(productData);
		product = await this.productRepository.save(product);

		product.sku = await this.ensureUniqueSKU(product);
		return this.productRepository.save(product);
	}

	async updateQuotationStatus(
		quotationId: number,
		status: OrderStatus,
		orgId?: number,
		branchId?: number,
	): Promise<{ success: boolean; message: string }> {
		// Build query with org and branch filters
		const queryBuilder = this.quotationRepository
			.createQueryBuilder('quotation')
			.where('quotation.uid = :quotationId', { quotationId });

		if (orgId) {
			queryBuilder
				.leftJoinAndSelect('quotation.organisation', 'organisation')
				.andWhere('organisation.uid = :orgId', { orgId });
		}

		if (branchId) {
			queryBuilder
				.leftJoinAndSelect('quotation.branch', 'branch')
				.andWhere('branch.uid = :branchId', { branchId });
		}

		// Add relations
		queryBuilder
			.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
			.leftJoinAndSelect('quotationItems.product', 'product')
			.leftJoinAndSelect('quotation.client', 'client');

		const quotation = await queryBuilder.getOne();

		if (!quotation) {
			return {
				success: false,
				message: 'Quotation not found',
			};
		}

		const previousStatus = quotation.status;

		// Validate status transition
		if (!this.isValidStatusTransition(previousStatus, status)) {
			return {
				success: false,
				message: `Invalid status transition from ${previousStatus} to ${status}`,
			};
		}

		// Special handling for specific status transitions
		if (status === OrderStatus.APPROVED) {
			// Update product analytics when quotation is approved
			for (const item of quotation?.quotationItems) {
				await this.productsService?.recordSale(item?.product?.uid, item?.quantity, Number(item?.totalPrice));
				await this.productsService?.calculateProductPerformance(item?.product?.uid);
			}
		}

		// Update the quotation status
		await this.quotationRepository.update(quotationId, {
			status,
			updatedAt: new Date(),
		});

		// Only send notification if the status has changed
		if (previousStatus !== status) {
			try {
				// Prepare email data
				const emailData = {
					name: quotation.client?.name || quotation.client?.email?.split('@')[0] || 'Valued Customer',
					quotationId: quotation.quotationNumber,
					validUntil: quotation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if not set
					total: Number(quotation.totalAmount),
					currency: this.currencyCode,
					status: status,
					quotationItems: quotation.quotationItems.map((item) => ({
						quantity: item.quantity,
						product: {
							uid: item.product.uid,
							name: item.product.name,
							code: item.product.sku || `SKU-${item.product.uid}`,
						},
						totalPrice: Number(item.totalPrice),
					})),
				};

				// Always notify internal team first
				const internalEmail = this.configService.get<string>('INTERNAL_BROADCAST_EMAIL');

				// Determine email type and message based on status
				let emailType = EmailType.QUOTATION_STATUS_UPDATE;
				let statusMessage = `updated to ${status}`;
				let clientNotification = true;

				// Status-specific email templates and messages
				switch (status) {
					case OrderStatus.DRAFT:
						emailType = EmailType.NEW_QUOTATION_INTERNAL;
						statusMessage = 'created as draft';
						clientNotification = false; // Don't notify client for draft status
						break;
					case OrderStatus.PENDING_INTERNAL:
						emailType = EmailType.QUOTATION_READY_FOR_REVIEW;
						statusMessage = 'ready for internal review';
						clientNotification = false;
						break;
					case OrderStatus.PENDING_CLIENT:
						emailType = EmailType.NEW_QUOTATION_CLIENT;
						statusMessage = 'sent to client for review';
						// Client notification handled separately below
						break;
					case OrderStatus.APPROVED:
						emailType = EmailType.QUOTATION_APPROVED;
						statusMessage = 'approved by client';
						break;
					case OrderStatus.REJECTED:
						emailType = EmailType.QUOTATION_REJECTED;
						statusMessage = 'rejected by client';
						break;
					case OrderStatus.SOURCING:
						emailType = EmailType.QUOTATION_SOURCING;
						statusMessage = 'being sourced';
						break;
					case OrderStatus.PACKING:
						emailType = EmailType.QUOTATION_PACKING;
						statusMessage = 'being packed';
						break;
					case OrderStatus.IN_FULFILLMENT:
						emailType = EmailType.QUOTATION_IN_FULFILLMENT;
						statusMessage = 'in fulfillment';
						break;
					case OrderStatus.PAID:
						emailType = EmailType.QUOTATION_PAID;
						statusMessage = 'marked as paid';
						break;
					case OrderStatus.OUTFORDELIVERY:
						emailType = EmailType.QUOTATION_SHIPPED;
						statusMessage = 'out for delivery';
						break;
					case OrderStatus.DELIVERED:
						emailType = EmailType.QUOTATION_DELIVERED;
						statusMessage = 'delivered';
						break;
					case OrderStatus.RETURNED:
						emailType = EmailType.QUOTATION_RETURNED;
						statusMessage = 'returned';
						break;
					case OrderStatus.COMPLETED:
						emailType = EmailType.QUOTATION_COMPLETED;
						statusMessage = 'completed';
						break;
					default:
						emailType = EmailType.QUOTATION_STATUS_UPDATE;
				}

				// Internal team notification
				this.eventEmitter.emit('send.email', emailType, [internalEmail], {
					...emailData,
					message: `Quotation ${quotation.quotationNumber} has been ${statusMessage}.`,
				});

				// Client notification for relevant statuses
				// Only send client notifications for statuses they need to know about
				const clientVisibleStatuses = [
					OrderStatus.PENDING_CLIENT,
					OrderStatus.APPROVED,
					OrderStatus.REJECTED,
					OrderStatus.SOURCING,
					OrderStatus.PACKING,
					OrderStatus.IN_FULFILLMENT,
					OrderStatus.PAID,
					OrderStatus.OUTFORDELIVERY,
					OrderStatus.DELIVERED,
					OrderStatus.RETURNED,
					OrderStatus.COMPLETED,
				];

				if (clientNotification && clientVisibleStatuses.includes(status) && quotation.client?.email) {
					// Special handling for PENDING_CLIENT status
					if (status === OrderStatus.PENDING_CLIENT) {
						// Include review URL for client review
						this.eventEmitter.emit('send.email', EmailType.NEW_QUOTATION_CLIENT, [quotation.client.email], {
							...emailData,
							reviewUrl: quotation.reviewUrl,
						});
					} else {
						// Standard notification for other statuses
						this.eventEmitter.emit('send.email', emailType, [quotation.client.email], emailData);
					}
				}

				// Also notify internal team about the status change via WebSocket
				this.shopGateway.notifyQuotationStatusChanged(quotationId, status);
			} catch (error) {
				this.logger.error('Failed to send quotation status update email:', error);
				// Continue with the process even if email sending fails
			}
		}

		return {
			success: true,
			message: `Quotation status updated to ${status}.`,
		};
	}

	// Helper method to validate status transitions
	private isValidStatusTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
		// Define allowed transitions for each status
		const allowedTransitions = {
			[OrderStatus.DRAFT]: [OrderStatus.PENDING_INTERNAL, OrderStatus.PENDING_CLIENT, OrderStatus.CANCELLED],
			[OrderStatus.PENDING_INTERNAL]: [OrderStatus.PENDING_CLIENT, OrderStatus.DRAFT, OrderStatus.CANCELLED],
			[OrderStatus.PENDING_CLIENT]: [
				OrderStatus.APPROVED,
				OrderStatus.REJECTED,
				OrderStatus.NEGOTIATION,
				OrderStatus.PENDING_INTERNAL,
				OrderStatus.CANCELLED,
			],
			[OrderStatus.NEGOTIATION]: [
				OrderStatus.PENDING_INTERNAL,
				OrderStatus.PENDING_CLIENT,
				OrderStatus.APPROVED,
				OrderStatus.REJECTED,
				OrderStatus.CANCELLED,
			],
			[OrderStatus.APPROVED]: [
				OrderStatus.SOURCING,
				OrderStatus.PACKING,
				OrderStatus.IN_FULFILLMENT,
				OrderStatus.CANCELLED,
				OrderStatus.NEGOTIATION,
			],
			[OrderStatus.SOURCING]: [OrderStatus.PACKING, OrderStatus.IN_FULFILLMENT, OrderStatus.CANCELLED],
			[OrderStatus.PACKING]: [OrderStatus.IN_FULFILLMENT, OrderStatus.OUTFORDELIVERY, OrderStatus.CANCELLED],
			[OrderStatus.IN_FULFILLMENT]: [
				OrderStatus.PAID,
				OrderStatus.PACKING,
				OrderStatus.OUTFORDELIVERY,
				OrderStatus.CANCELLED,
			],
			[OrderStatus.PAID]: [
				OrderStatus.PACKING,
				OrderStatus.OUTFORDELIVERY,
				OrderStatus.DELIVERED,
				OrderStatus.CANCELLED,
			],
			[OrderStatus.OUTFORDELIVERY]: [OrderStatus.DELIVERED, OrderStatus.RETURNED, OrderStatus.CANCELLED],
			[OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED, OrderStatus.CANCELLED],
			[OrderStatus.RETURNED]: [
				OrderStatus.COMPLETED,
				OrderStatus.CANCELLED,
				OrderStatus.SOURCING,
				OrderStatus.PACKING,
			],
			// Legacy statuses support - maintain backward compatibility
			[OrderStatus.PENDING]: [
				OrderStatus.INPROGRESS,
				OrderStatus.APPROVED,
				OrderStatus.REJECTED,
				OrderStatus.CANCELLED,
				OrderStatus.PENDING_INTERNAL,
				OrderStatus.PENDING_CLIENT,
			],
			[OrderStatus.INPROGRESS]: [
				OrderStatus.COMPLETED,
				OrderStatus.CANCELLED,
				OrderStatus.IN_FULFILLMENT,
				OrderStatus.SOURCING,
				OrderStatus.PACKING,
				OrderStatus.OUTFORDELIVERY,
				OrderStatus.DELIVERED,
			],
		};

		// Allow any transition for admin override (can be restricted based on roles later)
		// Check if the transition is allowed
		return allowedTransitions[fromStatus]?.includes(toStatus) || false;
	}

	async generateSKUsForExistingProducts(
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; updatedCount: number }> {
		try {
			// Build query with org and branch filters
			const queryBuilder = this.productRepository
				.createQueryBuilder('product')
				.where([{ sku: null }, { sku: '' }]);

			if (orgId) {
				queryBuilder.andWhere('product.organisationId = :orgId', { orgId });
			}

			if (branchId) {
				queryBuilder.andWhere('product.branchId = :branchId', { branchId });
			}

			const productsWithoutSKU = await queryBuilder.getMany();

			if (!productsWithoutSKU.length) {
				return {
					message: 'No products found requiring SKU generation',
					updatedCount: 0,
				};
			}

			const updatePromises = productsWithoutSKU.map(async (product) => {
				product.sku = await this.ensureUniqueSKU(product);
				return this.productRepository.save(product);
			});

			await Promise.all(updatePromises);

			return {
				message: `Successfully generated SKUs for ${productsWithoutSKU.length} products`,
				updatedCount: productsWithoutSKU.length,
			};
		} catch (error) {
			return {
				message: `Error generating SKUs: ${error.message}`,
				updatedCount: 0,
			};
		}
	}

	async regenerateAllSKUs(orgId?: number, branchId?: number): Promise<{ message: string; updatedCount: number }> {
		try {
			// Build query with org and branch filters
			const queryBuilder = this.productRepository.createQueryBuilder('product');

			if (orgId) {
				queryBuilder.andWhere('product.organisationId = :orgId', { orgId });
			}

			if (branchId) {
				queryBuilder.andWhere('product.branchId = :branchId', { branchId });
			}

			const allProducts = await queryBuilder.getMany();

			// Update each product with a new unique SKU
			const updatePromises = allProducts.map(async (product) => {
				product.sku = await this.ensureUniqueSKU(product);
				return this.productRepository.save(product);
			});

			await Promise.all(updatePromises);

			return {
				message: `Successfully regenerated SKUs for ${allProducts.length} products`,
				updatedCount: allProducts.length,
			};
		} catch (error) {
			return {
				message: `Error regenerating SKUs: ${error.message}`,
				updatedCount: 0,
			};
		}
	}

	async getQuotationsReport(filter: any, orgId?: number, branchId?: number) {
		try {
			// Add org and branch filters if provided
			if (orgId) {
				filter = { ...filter, 'organisation.uid': orgId };
			}

			if (branchId) {
				filter = { ...filter, 'branch.uid': branchId };
			}

			const quotations = await this.quotationRepository.find({
				where: filter,
				relations: ['placedBy', 'client', 'quotationItems', 'quotationItems.product', 'organisation', 'branch'],
			});

			if (!quotations) {
				throw new NotFoundException('No quotations found for the specified period');
			}

			const groupedQuotations = {
				pending: quotations.filter((quotation) => quotation.status === OrderStatus.PENDING),
				approved: quotations.filter((quotation) => quotation.status === OrderStatus.APPROVED),
				rejected: quotations.filter((quotation) => quotation.status === OrderStatus.REJECTED),
			};

			const totalQuotations = quotations.length;
			const totalValue = quotations.reduce((sum, quotation) => sum + Number(quotation.totalAmount), 0);
			const approvedQuotations = groupedQuotations.approved.length;

			// Analyze products
			const productStats = this.analyzeProducts(quotations);
			const orderTimeAnalysis = this.analyzeOrderTimes(quotations);
			const shopAnalysis = this.analyzeShops(quotations);
			const basketAnalysis = this.analyzeBaskets(quotations);

			return {
				...groupedQuotations,
				total: totalQuotations,
				metrics: {
					totalQuotations,
					grossQuotationValue: this.formatCurrency(totalValue),
					averageQuotationValue: this.formatCurrency(totalQuotations > 0 ? totalValue / totalQuotations : 0),
					conversionRate: `${((approvedQuotations / totalQuotations) * 100).toFixed(1)}%`,
					topProducts: productStats.topProducts,
					leastSoldProducts: productStats.leastSoldProducts,
					peakOrderTimes: orderTimeAnalysis,
					averageBasketSize: basketAnalysis.averageSize,
					topShops: shopAnalysis,
				},
			};
		} catch (error) {
			return null;
		}
	}

	private analyzeProducts(quotations: Quotation[]): {
		topProducts: Array<{
			productId: number;
			productName: string;
			totalSold: number;
			totalValue: string;
		}>;
		leastSoldProducts: Array<{
			productId: number;
			productName: string;
			totalSold: number;
			lastSoldDate: Date;
		}>;
	} {
		const productStats = new Map<
			number,
			{
				name: string;
				totalSold: number;
				totalValue: number;
				lastSoldDate: Date;
			}
		>();

		quotations.forEach((quotation) => {
			quotation.quotationItems?.forEach((item) => {
				if (!productStats.has(item.product.uid)) {
					productStats.set(item.product.uid, {
						name: item.product.name,
						totalSold: 0,
						totalValue: 0,
						lastSoldDate: quotation.createdAt,
					});
				}

				const stats = productStats.get(item.product.uid);
				stats.totalSold += item.quantity;
				stats.totalValue += Number(item.totalPrice);
				if (quotation.createdAt > stats.lastSoldDate) {
					stats.lastSoldDate = quotation.createdAt;
				}
			});
		});

		const sortedProducts = Array.from(productStats.entries()).map(([productId, stats]) => ({
			productId,
			productName: stats.name,
			totalSold: stats.totalSold,
			totalValue: this.formatCurrency(stats.totalValue),
			lastSoldDate: stats.lastSoldDate,
		}));

		return {
			topProducts: [...sortedProducts].sort((a, b) => b.totalSold - a.totalSold).slice(0, 10),
			leastSoldProducts: [...sortedProducts].sort((a, b) => a.totalSold - b.totalSold).slice(0, 10),
		};
	}

	private analyzeOrderTimes(quotations: Quotation[]): Array<{
		hour: number;
		count: number;
		percentage: string;
	}> {
		const hourCounts = new Array(24).fill(0);

		quotations.forEach((quotation) => {
			const hour = quotation.createdAt.getHours();
			hourCounts[hour]++;
		});

		return hourCounts
			.map((count, hour) => ({
				hour,
				count,
				percentage: `${((count / quotations.length) * 100).toFixed(1)}%`,
			}))
			.sort((a, b) => b.count - a.count);
	}

	private analyzeShops(quotations: Quotation[]): Array<{
		shopId: number;
		shopName: string;
		totalOrders: number;
		totalValue: string;
		averageOrderValue: string;
	}> {
		const shopStats = new Map<
			number,
			{
				name: string;
				orders: number;
				totalValue: number;
			}
		>();

		quotations.forEach((quotation) => {
			const shopId = quotation.placedBy?.branch?.uid;
			const shopName = quotation.placedBy?.branch?.name;

			if (shopId && shopName) {
				if (!shopStats.has(shopId)) {
					shopStats.set(shopId, {
						name: shopName,
						orders: 0,
						totalValue: 0,
					});
				}

				const stats = shopStats.get(shopId);
				stats.orders++;
				stats.totalValue += Number(quotation.totalAmount);
			}
		});

		return Array.from(shopStats.entries())
			.map(([shopId, stats]) => ({
				shopId,
				shopName: stats.name,
				totalOrders: stats.orders,
				totalValue: this.formatCurrency(stats.totalValue),
				averageOrderValue: this.formatCurrency(stats.totalValue / stats.orders),
			}))
			.sort((a, b) => b.totalOrders - a.totalOrders);
	}

	private analyzeBaskets(quotations: Quotation[]): {
		averageSize: number;
		sizeDistribution: Record<string, number>;
	} {
		const basketSizes = quotations.map((quotation) => quotation.quotationItems?.length || 0);

		const totalItems = basketSizes.reduce((sum, size) => sum + size, 0);
		const averageSize = totalItems / quotations.length;

		const sizeDistribution = basketSizes.reduce((acc, size) => {
			const range = this.getBasketSizeRange(size);
			acc[range] = (acc[range] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			averageSize: Number(averageSize.toFixed(1)),
			sizeDistribution,
		};
	}

	private getBasketSizeRange(size: number): string {
		if (size === 1) return '1 item';
		if (size <= 3) return '2-3 items';
		if (size <= 5) return '4-5 items';
		if (size <= 10) return '6-10 items';
		return '10+ items';
	}

	async findAll(
		filters?: {
			status?: OrderStatus;
			clientId?: number;
			startDate?: Date;
			endDate?: Date;
			search?: string;
			orgId?: number;
			branchId?: number;
		},
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
	): Promise<PaginatedResponse<Quotation>> {
		const skip = (page - 1) * limit;

		// Build the query
		const queryBuilder = this.quotationRepository
			.createQueryBuilder('quotation')
			.leftJoinAndSelect('quotation.placedBy', 'placedBy')
			.leftJoinAndSelect('quotation.client', 'client')
			.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
			.leftJoinAndSelect('quotationItems.product', 'product');

		// Apply filters
		if (filters?.status) {
			queryBuilder.andWhere('quotation.status = :status', { status: filters.status });
		}

		if (filters?.clientId) {
			queryBuilder.andWhere('client.uid = :clientId', { clientId: filters.clientId });
		}

		if (filters?.startDate && filters?.endDate) {
			queryBuilder.andWhere('quotation.quotationDate BETWEEN :startDate AND :endDate', {
				startDate: startOfDay(filters.startDate),
				endDate: endOfDay(filters.endDate),
			});
		}

		if (filters?.search) {
			queryBuilder.andWhere(
				'(client.name LIKE :search OR placedBy.name LIKE :search OR quotation.quotationNumber LIKE :search)',
				{ search: `%${filters.search}%` },
			);
		}

		// Add org and branch filters
		if (filters?.orgId) {
			queryBuilder
				.leftJoinAndSelect('quotation.organisation', 'organisation')
				.andWhere('organisation.uid = :orgId', { orgId: filters.orgId });
		}

		if (filters?.branchId) {
			queryBuilder
				.leftJoinAndSelect('quotation.branch', 'branch')
				.andWhere('branch.uid = :branchId', { branchId: filters.branchId });
		}

		// Count total records
		const total = await queryBuilder.getCount();

		// Get paginated results
		const quotations = await queryBuilder
			.orderBy('quotation.quotationDate', 'DESC')
			.skip(skip)
			.take(limit)
			.getMany();

		// Calculate total pages
		const totalPages = Math.ceil(total / limit);

		return {
			data: quotations,
			meta: {
				total,
				page,
				limit,
				totalPages,
			},
			message: process.env.SUCCESS_MESSAGE,
		};
	}

	async validateReviewToken(token: string): Promise<{ valid: boolean; quotation?: Quotation; message: string }> {
		try {
			// Find quotation by token
			const quotation = await this.quotationRepository.findOne({
				where: { reviewToken: token },
				relations: ['client', 'quotationItems', 'quotationItems.product', 'organisation', 'branch'],
			});

			if (!quotation) {
				return {
					valid: false,
					message: 'Invalid token. No quotation found with this token.',
				};
			}

			// Check if the quotation is in a state that allows client review
			const allowedReviewStatuses = [
				OrderStatus.PENDING_CLIENT,
				OrderStatus.NEGOTIATION,
				OrderStatus.PENDING, // Legacy status
			];

			if (!allowedReviewStatuses.includes(quotation.status)) {
				// If already processed
				if (
					[
						OrderStatus.COMPLETED,
						OrderStatus.REJECTED,
						OrderStatus.CANCELLED,
						OrderStatus.APPROVED,
						OrderStatus.IN_FULFILLMENT,
						OrderStatus.DELIVERED,
						OrderStatus.PAID,
					].includes(quotation.status)
				) {
					return {
						valid: false,
						message: `This quotation has already been ${quotation.status}.`,
					};
				}

				// For other statuses
				return {
					valid: false,
					message: `This quotation is not available for review. Current status: ${quotation.status}.`,
				};
			}

			// Check token expiry based on the validUntil date of the quotation
			const now = new Date();
			if (quotation.validUntil && now > quotation.validUntil) {
				return {
					valid: false,
					message: 'This quotation has expired. Please contact us for a new quotation.',
				};
			}

			// If all checks pass, return the quotation
			return {
				valid: true,
				quotation,
				message: 'Token is valid',
			};
		} catch (error) {
			this.logger.error(`Error validating review token: ${error.message}`, error.stack);
			return {
				valid: false,
				message: 'An error occurred while validating the token.',
			};
		}
	}

	async updateQuotationStatusByToken(
		token: string,
		status: OrderStatus,
		comments?: string,
	): Promise<{ success: boolean; message: string }> {
		try {
			// Only allow APPROVED, REJECTED, or NEGOTIATION statuses from client review
			if (![OrderStatus.APPROVED, OrderStatus.REJECTED, OrderStatus.NEGOTIATION].includes(status)) {
				return {
					success: false,
					message: 'Invalid status. Only APPROVED, REJECTED, or NEGOTIATION are allowed.',
				};
			}

			// Validate the token first
			const tokenValidation = await this.validateReviewToken(token);
			if (!tokenValidation.valid || !tokenValidation.quotation) {
				return {
					success: false,
					message: tokenValidation.message,
				};
			}

			const quotation = tokenValidation.quotation;

			// Add comments if provided
			if (comments) {
				await this.quotationRepository.update(quotation.uid, {
					status,
					notes: quotation.notes
						? `${quotation.notes}\n\nClient feedback: ${comments}`
						: `Client feedback: ${comments}`,
					updatedAt: new Date(),
				});
			} else {
				await this.quotationRepository.update(quotation.uid, {
					status,
					updatedAt: new Date(),
				});
			}

			// Send notification emails
			try {
				// Get the updated quotation with all relations
				const updatedQuotation = await this.quotationRepository.findOne({
					where: { uid: quotation.uid },
					relations: ['client', 'quotationItems', 'quotationItems.product'],
				});

				if (updatedQuotation && updatedQuotation.client?.email) {
					// Special handling for approved status - update product metrics
					if (status === OrderStatus.APPROVED) {
						for (const item of updatedQuotation.quotationItems) {
							if (item.product && item.product.uid) {
								await this.productsService.recordSale(
									item.product.uid,
									item.quantity,
									Number(item.totalPrice),
								);
								await this.productsService.calculateProductPerformance(item.product.uid);
							}
						}
					}

					// Prepare email data
					const emailData = {
						name: updatedQuotation.client.name || updatedQuotation.client.email.split('@')[0],
						quotationId: updatedQuotation.quotationNumber,
						validUntil: updatedQuotation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
						total: Number(updatedQuotation.totalAmount),
						currency: this.currencyCode,
						status: status,
						quotationItems: updatedQuotation.quotationItems.map((item) => ({
							quantity: item.quantity,
							product: {
								uid: item.product.uid,
								name: item.product.name,
								code: item.product.sku || `SKU-${item.product.uid}`,
							},
							totalPrice: Number(item.totalPrice),
						})),
					};

					// Determine which email template to use based on status
					let emailType = EmailType.QUOTATION_STATUS_UPDATE;

					switch (status) {
						case OrderStatus.APPROVED:
							emailType = EmailType.QUOTATION_APPROVED;
							break;
						case OrderStatus.REJECTED:
							emailType = EmailType.QUOTATION_REJECTED;
							break;
					}

					// Emit event for email sending
					this.eventEmitter.emit('send.email', emailType, [updatedQuotation.client.email], emailData);

					// Also notify internal team about the status change
					this.shopGateway.notifyQuotationStatusChanged(quotation.uid, status);
				}
			} catch (error) {
				// Log but don't fail if emails fail
				this.logger.error(`Failed to send quotation status update email: ${error.message}`, error.stack);
			}

			// Determine appropriate success message
			let successMsg: string;
			if (status === OrderStatus.APPROVED) {
				successMsg = 'Quotation has been approved successfully.';
			} else if (status === OrderStatus.REJECTED) {
				successMsg = 'Quotation has been rejected.';
			} else if (status === OrderStatus.NEGOTIATION) {
				successMsg = 'Feedback submitted. Our team will review your comments and get back to you shortly.';
			} else {
				successMsg = `Quotation status has been updated to ${status}.`;
			}

			return {
				success: true,
				message: successMsg,
			};
		} catch (error) {
			this.logger.error(`Error updating quotation status by token: ${error.message}`, error.stack);
			return {
				success: false,
				message: 'An error occurred while updating the quotation status.',
			};
		}
	}

	async sendQuotationToClient(
		quotationId: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ success: boolean; message: string }> {
		try {
			// Find the quotation with all relations
			const queryBuilder = this.quotationRepository
				.createQueryBuilder('quotation')
				.where('quotation.uid = :quotationId', { quotationId });

			if (orgId) {
				queryBuilder
					.leftJoinAndSelect('quotation.organisation', 'organisation')
					.andWhere('organisation.uid = :orgId', { orgId });
			}

			if (branchId) {
				queryBuilder
					.leftJoinAndSelect('quotation.branch', 'branch')
					.andWhere('branch.uid = :branchId', { branchId });
			}

			// Add relations
			queryBuilder
				.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
				.leftJoinAndSelect('quotationItems.product', 'product')
				.leftJoinAndSelect('quotation.client', 'client');

			const quotation = await queryBuilder.getOne();

			if (!quotation) {
				return {
					success: false,
					message: 'Quotation not found',
				};
			}

			// Validate the current status
			if (quotation.status !== OrderStatus.PENDING_INTERNAL && quotation.status !== OrderStatus.DRAFT) {
				return {
					success: false,
					message: `Cannot send quotation to client. Current status is ${quotation.status}.`,
				};
			}

			// Update quotation status to PENDING_CLIENT
			await this.quotationRepository.update(quotationId, {
				status: OrderStatus.PENDING_CLIENT,
				updatedAt: new Date(),
			});

			// Get updated quotation
			const updatedQuotation = await queryBuilder.getOne();

			if (!updatedQuotation || !updatedQuotation.client?.email) {
				return {
					success: false,
					message: 'Failed to update quotation or client email not found',
				};
			}

			// Prepare email data
			const emailData = {
				name: updatedQuotation.client.name || updatedQuotation.client.email.split('@')[0],
				quotationId: updatedQuotation.quotationNumber,
				validUntil: updatedQuotation.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				total: Number(updatedQuotation.totalAmount),
				currency: this.currencyCode,
				reviewUrl: updatedQuotation.reviewUrl,
				quotationItems: updatedQuotation.quotationItems.map((item) => ({
					quantity: item.quantity,
					product: {
						uid: item.product.uid,
						name: item.product.name,
						code: item.product.sku || `SKU-${item.product.uid}`,
					},
					totalPrice: Number(item.totalPrice),
				})),
			};

			// Now send the full quotation to the client
			this.eventEmitter.emit(
				'send.email',
				EmailType.NEW_QUOTATION_CLIENT,
				[updatedQuotation.client.email],
				emailData,
			);

			// Notify internal team that quotation was sent to client
			const internalEmail = this.configService.get<string>('INTERNAL_BROADCAST_EMAIL');
			this.eventEmitter.emit('send.email', EmailType.QUOTATION_STATUS_UPDATE, [internalEmail], {
				...emailData,
				message: `Quotation ${updatedQuotation.quotationNumber} has been sent to the client for review.`,
			});

			// Emit WebSocket event
			this.shopGateway.notifyQuotationStatusChanged(quotationId, OrderStatus.PENDING_CLIENT);

			return {
				success: true,
				message: 'Quotation has been sent to the client for review.',
			};
		} catch (error) {
			this.logger.error(`Error sending quotation to client: ${error.message}`, error.stack);
			return {
				success: false,
				message: 'An error occurred while sending the quotation to client.',
			};
		}
	}
}
