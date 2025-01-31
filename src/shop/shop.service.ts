import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Quotation } from './entities/quotation.entity';
import { Banners } from './entities/banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ProductStatus } from '../lib/enums/product.enums';
import { Product } from '../products/entities/product.entity';
import { Between } from 'typeorm';
import { startOfDay, endOfDay } from 'date-fns';
import { OrderStatus } from '../lib/enums/status.enums';
import { ConfigService } from '@nestjs/config';
import { EmailType } from '../lib/enums/email.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientsService } from '../clients/clients.service';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Injectable()
export class ShopService {
    private readonly currencyLocale: string;
    private readonly currencyCode: string;
    private readonly currencySymbol: string;

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
            const allProducts = await this.productRepository.find();

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
            const products = await this.productRepository.find({ where: { status } });
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

    async createQuotation(quotationData: CheckoutDto): Promise<{ message: string }> {
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

            const newQuotation = {
                quotationNumber: `QUO-${Date.now()}`,
                totalItems: Number(quotationData?.totalItems),
                totalAmount: Number(quotationData?.totalAmount),
                placedBy: { uid: quotationData?.owner?.uid },
                client: { uid: quotationData?.client?.uid },
                status: OrderStatus.PENDING,
                quotationItems: quotationData?.items?.map(item => ({
                    quantity: Number(item?.quantity),
                    product: { uid: item?.uid },
                    totalPrice: Number(item?.totalPrice),
                }))
            } as const;

            await this.quotationRepository.save(newQuotation);

            const baseConfig = {
                name: clientName,
                quotationId: newQuotation?.quotationNumber,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days validity
                total: Number(newQuotation?.totalAmount),
                currency: this.currencyCode,
                quotationItems: quotationData?.items?.map(item => ({
                    quantity: Number(item?.quantity),
                    product: { uid: item?.uid },
                    totalPrice: Number(item?.totalPrice),
                }))
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
            return {
                message: error?.message,
            };
        }
    }

    async createBanner(bannerData: CreateBannerDto): Promise<{ banner: Banners | null, message: string }> {
        try {
            const newBanner = this.bannersRepository.create(bannerData);
            const savedBanner = await this.bannersRepository.save(newBanner);

            return {
                banner: savedBanner,
                message: process.env.SUCCESS_MESSAGE,
            };
        } catch (error) {
            return {
                banner: null,
                message: error?.message,
            };
        }
    }

    async getBanner(): Promise<{ banners: Banners[], message: string }> {
        try {
            const banners = await this.bannersRepository.find({
                take: 5,
                order: {
                    createdAt: 'DESC'
                }
            });

            if (!banners) {
                throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }

            const response = {
                banners,
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        } catch (error) {
            const response = {
                message: error?.message,
                banners: []
            }

            return response;
        }
    }

    async updateBanner(uid: number, bannerData: UpdateBannerDto): Promise<{ banner: Banners | null, message: string }> {
        try {
            const banner = await this.bannersRepository.findOne({ where: { uid } });

            if (!banner) {
                throw new NotFoundException('Banner not found');
            }

            await this.bannersRepository.update({ uid }, bannerData);
            const updatedBanner = await this.bannersRepository.findOne({ where: { uid } });

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

    async deleteBanner(uid: number): Promise<{ message: string }> {
        try {
            const banner = await this.bannersRepository.findOne({ where: { uid } });

            if (!banner) {
                throw new NotFoundException('Banner not found');
            }

            await this.bannersRepository.delete({ uid });

            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        } catch (error) {
            return {
                message: error?.message,
            };
        }
    }

    async getAllQuotations(): Promise<{ quotations: Quotation[], message: string }> {
        try {
            const quotations = await this.quotationRepository.find({
                relations: ['placedBy', 'client', 'quotationItems']
            });

            if (!quotations) {
                throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }

            const response = {
                quotations,
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        } catch (error) {
            const response = {
                message: error?.message,
                quotations: []
            }

            return response;
        }
    }

    async getQuotationsByUser(ref: number): Promise<{ quotations: Quotation[], message: string }> {
        try {
            const quotations = await this.quotationRepository.find({
                where: {
                    placedBy: {
                        uid: ref
                    }
                },
                relations: ['placedBy', 'client', 'quotationItems']
            });

            if (!quotations) {
                throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }

            const formattedQuotations = quotations.map(quotation => ({
                ...quotation,
                totalAmount: Number(quotation.totalAmount)
            }));

            return {
                quotations: formattedQuotations,
                message: process.env.SUCCESS_MESSAGE,
            };
        } catch (error) {
            return {
                message: error?.message,
                quotations: []
            }
        }
    }

    async getQuotationByRef(ref: number): Promise<{ quotation: Quotation, message: string }> {
        try {
            const quotation = await this.quotationRepository.findOne({
                where: {
                    uid: ref
                },
                relations: ['placedBy', 'client', 'quotationItems', 'quotationItems.product']
            });

            if (!quotation) {
                throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }

            const formattedQuotation = {
                ...quotation,
                totalAmount: Number(quotation.totalAmount)
            };

            return {
                quotation: formattedQuotation,
                message: process.env.SUCCESS_MESSAGE,
            };
        } catch (error) {
            return {
                message: error?.message,
                quotation: null
            }
        }
    }

    async getQuotationsForDate(date: Date): Promise<{
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
            const quotations = await this.quotationRepository.find({
                where: {
                    createdAt: Between(startOfDay(date), endOfDay(date))
                },
                relations: ['quotationItems']
            });

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

    async generateSKUsForExistingProducts(): Promise<{ message: string, updatedCount: number }> {
        try {
            const productsWithoutSKU = await this.productRepository.find({
                where: [
                    { sku: null },
                    { sku: '' }
                ]
            });

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

    async regenerateAllSKUs(): Promise<{ message: string, updatedCount: number }> {
        try {
            // Get all products
            const allProducts = await this.productRepository.find();

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
}

