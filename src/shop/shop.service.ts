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

@Injectable()
export class ShopService {
    private readonly currencyLocale: string;
    private readonly currencyCode: string;
    private readonly currencySymbol: string;
    private readonly logger = new Logger(ShopService.name);

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
    ) {
        this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
    }

    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat(this.currencyLocale, {
            style: 'currency',
            currency: this.currencyCode
        })
            .format(amount)
            .replace(this.currencyCode, this.currencySymbol);
    }

    async categories(): Promise<{ categories: string[] | null, message: string }> {
        try {
            // Remove org and branch filters
            const query = this.productRepository.createQueryBuilder('product');
            const allProducts = await query.getMany();

            if (!allProducts) {
                throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }

            // Format prices before returning products
            const formattedProducts = allProducts.map(product => ({
                ...product,
                price: this.formatCurrency(Number(product.price) || 0)
            }));

            const categories = formattedProducts.map(product => product?.category);
            const uniqueCategories = [...new Set(categories)];

            const response = {
                categories: uniqueCategories,
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        } catch (error) {
            const response = {
                message: error?.message,
                categories: null
            }

            return response;
        }
    }

    private async getProductsByStatus(status: ProductStatus): Promise<{ products: Product[] | null }> {
        try {
            const query = this.productRepository.createQueryBuilder('product')
                .where('product.status = :status', { status });
            
            const products = await query.getMany();
            return { products: products ?? null };
        } catch (error) {
            return { products: null };
        }
    }

    async specials(): Promise<{ products: Product[] | null, message: string }> {
        const result = await this.getProductsByStatus(ProductStatus.SPECIAL);

        const response = {
            products: result?.products,
            message: process.env.SUCCESS_MESSAGE,
        }

        return response;
    }

    async getBestSellers(): Promise<{ products: Product[] | null, message: string }> {
        const result = await this.getProductsByStatus(ProductStatus.BEST_SELLER);

        const response = {
            products: result.products,
            message: process.env.SUCCESS_MESSAGE,
        }

        return response;
    }

    async getNewArrivals(): Promise<{ products: Product[] | null, message: string }> {
        const result = await this.getProductsByStatus(ProductStatus.NEW);

        const response = {
            products: result.products,
            message: process.env.SUCCESS_MESSAGE,
        }

        return response;
    }

    async getHotDeals(): Promise<{ products: Product[] | null, message: string }> {
        const result = await this.getProductsByStatus(ProductStatus.HOTDEALS);

        const response = {
            products: result.products,
            message: process.env.SUCCESS_MESSAGE,
        }

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

            const clientData = await this.clientsService?.findOne(Number(quotationData?.client?.uid));

            if (!clientData) {
                throw new NotFoundException(process.env.CLIENT_NOT_FOUND_MESSAGE);
            }

            const { name: clientName } = clientData?.client;
            const internalEmail = this.configService.get<string>('INTERNAL_BROADCAST_EMAIL');

            const productPromises = quotationData?.items?.map(item =>
                this.productRepository.find({ where: { uid: item?.uid }, relations: ['reseller'] })
            );

            const products = await Promise.all(productPromises);

            const resellerEmails = products
                .flat()
                .map(product => ({
                    email: product?.reseller?.email,
                    retailerName: product?.reseller?.name
                }))
                .filter(email => email?.email)
                .reduce((unique, item) => {
                    return unique?.some(u => u?.email === item?.email)
                        ? unique
                        : [...unique, item];
                }, []);

            // Create a map of product UIDs to their references
            const productRefs = new Map(
                products.flat().map(product => [product.uid, product.productRef])
            );

            // Validate that all products were found
            const missingProducts = quotationData?.items?.filter(item => !productRefs.has(item.uid));

            if (missingProducts?.length > 0) {
                throw new Error(`Products not found for items: ${missingProducts.map(item => item.uid).join(', ')}`);
            }

            const newQuotation = {
                quotationNumber: `QUO-${Date.now()}`,
                totalItems: Number(quotationData?.totalItems),
                totalAmount: Number(quotationData?.totalAmount),
                placedBy: { uid: quotationData?.owner?.uid },
                client: { uid: quotationData?.client?.uid },
                status: OrderStatus.PENDING,
                quotationDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                quotationItems: quotationData?.items?.map(item => {
                    const product = products.flat().find(p => p.uid === item.uid);
                    return {
                        quantity: Number(item?.quantity),
                        product: { 
                            uid: item?.uid,
                            name: product?.name,
                            sku: product?.sku,
                            productRef: product?.productRef,
                            price: product?.price
                        },
                        unitPrice: Number(product?.price || 0),
                        totalPrice: Number(item?.totalPrice),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                })
            };

            // Add organization and branch if available
            if (orgId) {
                newQuotation['organisation'] = { uid: orgId };
            }
            
            if (branchId) {
                newQuotation['branch'] = { uid: branchId };
            }

            const savedQuotation = await this.quotationRepository.save(newQuotation);

            // Update analytics for each product
            for (const item of quotationData.items) {
                const product = products.flat().find(p => p.uid === item.uid);
                if (product) {
                    // Record view and cart add
                    await this.productsService.recordView(product.uid);
                    await this.productsService.recordCartAdd(product.uid);

                    // If quotation is approved, record the sale
                    if (savedQuotation.status === OrderStatus.APPROVED) {
                        await this.productsService.recordSale(
                            product.uid,
                            item.quantity,
                            Number(product.price)
                        );
                    }

                    // Update stock history
                    await this.productsService.updateStockHistory(
                        product.uid,
                        item.quantity,
                        'out'
                    );

                    // Calculate updated performance metrics
                    await this.productsService.calculateProductPerformance(product.uid);
                }
            }

            // Emit WebSocket event for new quotation
            this.shopGateway.emitNewQuotation(savedQuotation?.quotationNumber);

            const baseConfig = {
                name: clientName,
                quotationId: savedQuotation?.quotationNumber,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days validity
                total: Number(savedQuotation?.totalAmount),
                currency: this.currencyCode,
                quotationItems: quotationData?.items?.map(item => {
                    const product = products.flat().find(p => p.uid === item.uid);
                    return {
                        quantity: Number(item?.quantity),
                        product: { 
                            uid: item?.uid,
                            name: product?.name || 'Unknown Product',
                            code: product?.productRef || 'N/A'
                        },
                        totalPrice: Number(item?.totalPrice),
                    };
                })
            }

            const clientConfig = {
                ...baseConfig,
            }

            const internalConfig = {
                ...baseConfig,
            }

            const resellerConfigs = resellerEmails?.map(email => ({
                ...baseConfig,
                name: email?.retailerName,
                email: email?.email,
            }));

            this.eventEmitter.emit('send.email', EmailType.NEW_QUOTATION_INTERNAL, [internalEmail], internalConfig);

            resellerConfigs?.forEach(config => {
                this.eventEmitter.emit('send.email', EmailType.NEW_QUOTATION_RESELLER, [config?.email], config);
            });

            this.eventEmitter.emit('send.email', EmailType.NEW_QUOTATION_CLIENT, [clientData?.client?.email], clientConfig);

            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            this.logger.error(`Error creating quotation: ${error.message}`, error.stack);
            return {
                message: error?.message,
            };
        }
    }

    async createBanner(bannerData: CreateBannerDto, orgId?: number, branchId?: number): Promise<{ banner: Banners | null, message: string }> {
        try {
            // Create the banner with the correct field names for organization and branch
            const bannerToSave = {
                ...bannerData
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
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            return {
                banner: null,
                message: error?.message
            };
        }
    }

    async getBanner(orgId?: number, branchId?: number): Promise<{ banners: Banners[], message: string }> {
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
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            return {
                banners: [],
                message: error?.message
            };
        }
    }

    async updateBanner(uid: number, bannerData: UpdateBannerDto, orgId?: number, branchId?: number): Promise<{ banner: Banners | null, message: string }> {
        try {
            // Find the banner first to apply filters
            const query = this.bannersRepository.createQueryBuilder('banner')
                .where('banner.uid = :uid', { uid });
            
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
                where: { uid }
            });
            
            return {
                banner: updatedBanner,
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            return {
                banner: null,
                message: error?.message
            };
        }
    }

    async deleteBanner(uid: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
        try {
            // Find the banner first to apply filters
            const query = this.bannersRepository.createQueryBuilder('banner')
                .where('banner.uid = :uid', { uid });
            
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
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            return {
                message: error?.message
            };
        }
    }

    async getAllQuotations(orgId?: number, branchId?: number): Promise<{ quotations: Quotation[], message: string }> {
        try {
            const query = this.quotationRepository.createQueryBuilder('quotation')
                .leftJoinAndSelect('quotation.placedBy', 'placedBy')
                .leftJoinAndSelect('quotation.client', 'client')
                .leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
                .leftJoinAndSelect('quotationItems.product', 'product');
            
            if (orgId) {
                query.leftJoinAndSelect('quotation.organisation', 'organisation')
                    .andWhere('organisation.uid = :orgId', { orgId });
            }
            
            if (branchId) {
                query.leftJoinAndSelect('quotation.branch', 'branch')
                    .andWhere('branch.uid = :branchId', { branchId });
            }
            
            const quotations = await query.getMany();
            
            return {
                quotations,
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            return {
                quotations: [],
                message: error?.message
            };
        }
    }

    async getQuotationsByUser(ref: number, orgId?: number, branchId?: number): Promise<{ quotations: Quotation[], message: string }> {
        try {
            const query = this.quotationRepository.createQueryBuilder('quotation')
                .leftJoinAndSelect('quotation.placedBy', 'placedBy')
                .leftJoinAndSelect('quotation.client', 'client')
                .leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
                .leftJoinAndSelect('quotationItems.product', 'product')
                .where('placedBy.uid = :ref', { ref });
            
            if (orgId) {
                query.leftJoinAndSelect('quotation.organisation', 'organisation')
                    .andWhere('organisation.uid = :orgId', { orgId });
            }
            
            if (branchId) {
                query.leftJoinAndSelect('quotation.branch', 'branch')
                    .andWhere('branch.uid = :branchId', { branchId });
            }
            
            const quotations = await query.getMany();
            
            return {
                quotations,
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            return {
                quotations: [],
                message: error?.message
            };
        }
    }

    async getQuotationByRef(ref: number, orgId?: number, branchId?: number): Promise<{ quotation: Quotation, message: string }> {
        try {
            const query = this.quotationRepository.createQueryBuilder('quotation')
                .leftJoinAndSelect('quotation.placedBy', 'placedBy')
                .leftJoinAndSelect('quotation.client', 'client')
                .leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
                .leftJoinAndSelect('quotationItems.product', 'product')
                .where('quotation.uid = :ref', { ref });
            
            if (orgId) {
                query.leftJoinAndSelect('quotation.organisation', 'organisation')
                    .andWhere('organisation.uid = :orgId', { orgId });
            }
            
            if (branchId) {
                query.leftJoinAndSelect('quotation.branch', 'branch')
                    .andWhere('branch.uid = :branchId', { branchId });
            }
            
            const quotation = await query.getOne();
            
            if (!quotation) {
                throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            
            return {
                quotation,
                message: process.env.SUCCESS_MESSAGE
            };
        } catch (error) {
            throw error;
        }
    }

    async getQuotationsForDate(date: Date, orgId?: number, branchId?: number): Promise<{
        message: string,
        stats: {
            quotations: {
                pending: Quotation[],
                processing: Quotation[],
                completed: Quotation[],
                cancelled: Quotation[],
                postponed: Quotation[],
                rejected: Quotation[],
                approved: Quotation[],
                metrics: {
                    totalQuotations: number,
                    grossQuotationValue: string,
                    averageQuotationValue: string
                }
            },
        }
    }> {
        try {
            const queryBuilder = this.quotationRepository.createQueryBuilder('quotation')
                .where('quotation.createdAt BETWEEN :startDate AND :endDate', {
                    startDate: startOfDay(date),
                    endDate: endOfDay(date)
                })
                .leftJoinAndSelect('quotation.quotationItems', 'quotationItems');
            
            if (orgId) {
                queryBuilder.leftJoinAndSelect('quotation.organisation', 'organisation')
                    .andWhere('organisation.uid = :orgId', { orgId });
            }
            
            if (branchId) {
                queryBuilder.leftJoinAndSelect('quotation.branch', 'branch')
                    .andWhere('branch.uid = :branchId', { branchId });
            }
            
            const quotations = await queryBuilder.getMany();

            if (!quotations) {
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            }

            // Group quotations by status
            const groupedQuotations = {
                pending: quotations.filter(quotation => quotation?.status === OrderStatus.PENDING),
                processing: quotations.filter(quotation => quotation?.status === OrderStatus.INPROGRESS),
                completed: quotations.filter(quotation => quotation?.status === OrderStatus.COMPLETED),
                cancelled: quotations.filter(quotation => quotation?.status === OrderStatus.CANCELLED),
                postponed: quotations.filter(quotation => quotation?.status === OrderStatus.POSTPONED),
                rejected: quotations.filter(quotation => quotation?.status === OrderStatus.REJECTED),
                approved: quotations.filter(quotation => quotation?.status === OrderStatus.APPROVED)
            };

            // Calculate metrics with formatted currency
            const metrics = {
                totalQuotations: quotations?.length,
                grossQuotationValue: this.formatCurrency(
                    quotations?.reduce((sum, quotation) => sum + (Number(quotation?.totalAmount) || 0), 0)
                ),
                averageQuotationValue: this.formatCurrency(
                    quotations?.length > 0
                        ? quotations?.reduce((sum, quotation) => sum + (Number(quotation?.totalAmount) || 0), 0) / quotations?.length
                        : 0
                )
            };

            return {
                message: process.env.SUCCESS_MESSAGE,
                stats: {
                    quotations: {
                        ...groupedQuotations,
                        metrics
                    }
                }
            };
        } catch (error) {
            return {
                message: error?.message,
                stats: null
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

    async updateQuotationStatus(quotationId: number, status: OrderStatus, orgId?: number, branchId?: number): Promise<void> {
        // Build query with org and branch filters
        const queryBuilder = this.quotationRepository.createQueryBuilder('quotation')
            .where('quotation.uid = :quotationId', { quotationId });
        
        if (orgId) {
            queryBuilder.leftJoinAndSelect('quotation.organisation', 'organisation')
                .andWhere('organisation.uid = :orgId', { orgId });
        }
        
        if (branchId) {
            queryBuilder.leftJoinAndSelect('quotation.branch', 'branch')
                .andWhere('branch.uid = :branchId', { branchId });
        }
        
        // Add relations
        queryBuilder.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
            .leftJoinAndSelect('quotationItems.product', 'product')
            .leftJoinAndSelect('quotation.client', 'client');
        
        const quotation = await queryBuilder.getOne();

        if (!quotation) return;

        const previousStatus = quotation.status;
        
        // If quotation is approved, update product analytics
        if (status === OrderStatus.APPROVED) {
            for (const item of quotation?.quotationItems) {
                await this.productsService?.recordSale(
                    item?.product?.uid,
                    item?.quantity,
                    Number(item?.totalPrice)
                );
                await this.productsService?.calculateProductPerformance(item?.product?.uid);
            }
        }

        // Update the quotation status
        await this.quotationRepository.update(quotationId, { status });

        // Only send notification if the status has changed
        if (previousStatus !== status && quotation.client?.email) {
            try {
                // Prepare email data
                const emailData = {
                    name: quotation.client.name || quotation.client.email.split('@')[0],
                    quotationId: quotation.quotationNumber,
                    validUntil: quotation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if not set
                    total: Number(quotation.totalAmount),
                    currency: this.currencyCode,
                    status: status.toLowerCase(),
                    quotationItems: quotation.quotationItems.map(item => ({
                        quantity: item.quantity,
                        product: {
                            uid: item.product.uid,
                            name: item.product.name,
                            code: item.product.sku || `SKU-${item.product.uid}`
                        },
                        totalPrice: Number(item.totalPrice)
                    }))
                };

                // Determine which email template to use based on status
                let emailType = EmailType.QUOTATION_STATUS_UPDATE;
                if (status === OrderStatus.APPROVED) {
                    emailType = EmailType.QUOTATION_APPROVED;
                } else if (status === OrderStatus.REJECTED) {
                    emailType = EmailType.QUOTATION_REJECTED;
                }

                // Emit event for email sending
                this.eventEmitter.emit('send.email', emailType, [quotation.client.email], emailData);
                
                // Also notify internal team about the status change
                this.shopGateway.notifyQuotationStatusChanged(quotationId, status);
            } catch (error) {
                console.error('Failed to send quotation status update email:', error);
                // Continue with the process even if email sending fails
            }
        }
    }

    async generateSKUsForExistingProducts(orgId?: number, branchId?: number): Promise<{ message: string, updatedCount: number }> {
        try {
            // Build query with org and branch filters
            const queryBuilder = this.productRepository.createQueryBuilder('product')
                .where([
                    { sku: null },
                    { sku: '' }
                ]);
            
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
                    updatedCount: 0
                };
            }

            const updatePromises = productsWithoutSKU.map(async (product) => {
                product.sku = await this.ensureUniqueSKU(product);
                return this.productRepository.save(product);
            });

            await Promise.all(updatePromises);

            return {
                message: `Successfully generated SKUs for ${productsWithoutSKU.length} products`,
                updatedCount: productsWithoutSKU.length
            };
        } catch (error) {
            return {
                message: `Error generating SKUs: ${error.message}`,
                updatedCount: 0
            };
        }
    }

    async regenerateAllSKUs(orgId?: number, branchId?: number): Promise<{ message: string, updatedCount: number }> {
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
                updatedCount: allProducts.length
            };
        } catch (error) {
            return {
                message: `Error regenerating SKUs: ${error.message}`,
                updatedCount: 0
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
                relations: ['placedBy', 'client', 'quotationItems', 'quotationItems.product', 'organisation', 'branch']
            });

            if (!quotations) {
                throw new NotFoundException('No quotations found for the specified period');
            }

            const groupedQuotations = {
                pending: quotations.filter(quotation => quotation.status === OrderStatus.PENDING),
                approved: quotations.filter(quotation => quotation.status === OrderStatus.APPROVED),
                rejected: quotations.filter(quotation => quotation.status === OrderStatus.REJECTED)
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
                    topShops: shopAnalysis
                }
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
        const productStats = new Map<number, {
            name: string;
            totalSold: number;
            totalValue: number;
            lastSoldDate: Date;
        }>();

        quotations.forEach(quotation => {
            quotation.quotationItems?.forEach(item => {
                if (!productStats.has(item.product.uid)) {
                    productStats.set(item.product.uid, {
                        name: item.product.name,
                        totalSold: 0,
                        totalValue: 0,
                        lastSoldDate: quotation.createdAt
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

        const sortedProducts = Array.from(productStats.entries())
            .map(([productId, stats]) => ({
                productId,
                productName: stats.name,
                totalSold: stats.totalSold,
                totalValue: this.formatCurrency(stats.totalValue),
                lastSoldDate: stats.lastSoldDate
            }));

        return {
            topProducts: [...sortedProducts]
                .sort((a, b) => b.totalSold - a.totalSold)
                .slice(0, 10),
            leastSoldProducts: [...sortedProducts]
                .sort((a, b) => a.totalSold - b.totalSold)
                .slice(0, 10)
        };
    }

    private analyzeOrderTimes(quotations: Quotation[]): Array<{
        hour: number;
        count: number;
        percentage: string;
    }> {
        const hourCounts = new Array(24).fill(0);

        quotations.forEach(quotation => {
            const hour = quotation.createdAt.getHours();
            hourCounts[hour]++;
        });

        return hourCounts.map((count, hour) => ({
            hour,
            count,
            percentage: `${((count / quotations.length) * 100).toFixed(1)}%`
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
        const shopStats = new Map<number, {
            name: string;
            orders: number;
            totalValue: number;
        }>();

        quotations.forEach(quotation => {
            const shopId = quotation.placedBy?.branch?.uid;
            const shopName = quotation.placedBy?.branch?.name;

            if (shopId && shopName) {
                if (!shopStats.has(shopId)) {
                    shopStats.set(shopId, {
                        name: shopName,
                        orders: 0,
                        totalValue: 0
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
                averageOrderValue: this.formatCurrency(stats.totalValue / stats.orders)
            }))
            .sort((a, b) => b.totalOrders - a.totalOrders);
    }

    private analyzeBaskets(quotations: Quotation[]): {
        averageSize: number;
        sizeDistribution: Record<string, number>;
    } {
        const basketSizes = quotations.map(quotation =>
            quotation.quotationItems?.length || 0
        );

        const totalItems = basketSizes.reduce((sum, size) => sum + size, 0);
        const averageSize = totalItems / quotations.length;

        const sizeDistribution = basketSizes.reduce((acc, size) => {
            const range = this.getBasketSizeRange(size);
            acc[range] = (acc[range] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            averageSize: Number(averageSize.toFixed(1)),
            sizeDistribution
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
        limit: number = Number(process.env.DEFAULT_PAGE_LIMIT)
    ): Promise<PaginatedResponse<Quotation>> {
        const skip = (page - 1) * limit;
        
        // Build the query
        const queryBuilder = this.quotationRepository.createQueryBuilder('quotation')
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
                endDate: endOfDay(filters.endDate)
            });
        }
        
        if (filters?.search) {
            queryBuilder.andWhere(
                '(client.name LIKE :search OR placedBy.name LIKE :search OR quotation.quotationNumber LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
        
        // Add org and branch filters
        if (filters?.orgId) {
            queryBuilder.leftJoinAndSelect('quotation.organisation', 'organisation')
                .andWhere('organisation.uid = :orgId', { orgId: filters.orgId });
        }
        
        if (filters?.branchId) {
            queryBuilder.leftJoinAndSelect('quotation.branch', 'branch')
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
                totalPages
            },
            message: process.env.SUCCESS_MESSAGE
        };
    }
}

