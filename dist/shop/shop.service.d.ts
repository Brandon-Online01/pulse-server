import { Repository } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Quotation } from './entities/quotation.entity';
import { Banners } from './entities/banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from '../lib/enums/status.enums';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientsService } from '../clients/clients.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ShopGateway } from './shop.gateway';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
export declare class ShopService {
    private productRepository;
    private quotationRepository;
    private bannersRepository;
    private readonly configService;
    private readonly clientsService;
    private readonly eventEmitter;
    private readonly shopGateway;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(productRepository: Repository<Product>, quotationRepository: Repository<Quotation>, bannersRepository: Repository<Banners>, configService: ConfigService, clientsService: ClientsService, eventEmitter: EventEmitter2, shopGateway: ShopGateway);
    private formatCurrency;
    categories(): Promise<{
        categories: string[] | null;
        message: string;
    }>;
    private getProductsByStatus;
    specials(): Promise<{
        products: Product[] | null;
        message: string;
    }>;
    getBestSellers(): Promise<{
        products: Product[] | null;
        message: string;
    }>;
    getNewArrivals(): Promise<{
        products: Product[] | null;
        message: string;
    }>;
    getHotDeals(): Promise<{
        products: Product[] | null;
        message: string;
    }>;
    createQuotation(quotationData: CheckoutDto): Promise<{
        message: string;
    }>;
    createBanner(bannerData: CreateBannerDto): Promise<{
        banner: Banners | null;
        message: string;
    }>;
    getBanner(): Promise<{
        banners: Banners[];
        message: string;
    }>;
    updateBanner(uid: number, bannerData: UpdateBannerDto): Promise<{
        banner: Banners | null;
        message: string;
    }>;
    deleteBanner(uid: number): Promise<{
        message: string;
    }>;
    getAllQuotations(): Promise<{
        quotations: Quotation[];
        message: string;
    }>;
    getQuotationsByUser(ref: number): Promise<{
        quotations: Quotation[];
        message: string;
    }>;
    getQuotationByRef(ref: number): Promise<{
        quotation: Quotation;
        message: string;
    }>;
    getQuotationsForDate(date: Date): Promise<{
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
    }>;
    private ensureUniqueSKU;
    createProduct(productData: CreateProductDto): Promise<Product>;
    generateSKUsForExistingProducts(): Promise<{
        message: string;
        updatedCount: number;
    }>;
    regenerateAllSKUs(): Promise<{
        message: string;
        updatedCount: number;
    }>;
    getQuotationsReport(filter: any): Promise<{
        total: number;
        metrics: {
            totalQuotations: number;
            grossQuotationValue: string;
            averageQuotationValue: string;
            conversionRate: string;
            topProducts: {
                productId: number;
                productName: string;
                totalSold: number;
                totalValue: string;
            }[];
            leastSoldProducts: {
                productId: number;
                productName: string;
                totalSold: number;
                lastSoldDate: Date;
            }[];
            peakOrderTimes: {
                hour: number;
                count: number;
                percentage: string;
            }[];
            averageBasketSize: number;
            topShops: {
                shopId: number;
                shopName: string;
                totalOrders: number;
                totalValue: string;
                averageOrderValue: string;
            }[];
        };
        pending: Quotation[];
        approved: Quotation[];
        rejected: Quotation[];
    }>;
    private analyzeProducts;
    private analyzeOrderTimes;
    private analyzeShops;
    private analyzeBaskets;
    private getBasketSizeRange;
    findAll(filters?: {
        status?: OrderStatus;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
        search?: string;
    }, page?: number, limit?: number): Promise<PaginatedResponse<Quotation>>;
}
