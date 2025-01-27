import { Repository } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Quotation } from './entities/quotation.entity';
import { Banners } from './entities/banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Product } from '../products/entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../clients/clients.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ShopService {
    private productRepository;
    private quotationRepository;
    private bannersRepository;
    private readonly configService;
    private readonly clientsService;
    private readonly eventEmitter;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(productRepository: Repository<Product>, quotationRepository: Repository<Quotation>, bannersRepository: Repository<Banners>, configService: ConfigService, clientsService: ClientsService, eventEmitter: EventEmitter2);
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
    checkout(orderItems: CheckoutDto): Promise<{
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
    getAllOrders(): Promise<{
        orders: Quotation[];
        message: string;
    }>;
    getOrdersByUser(ref: number): Promise<{
        orders: Quotation[];
        message: string;
    }>;
    getOrderByRef(ref: number): Promise<{
        orders: Quotation;
        message: string;
    }>;
    getOrdersForDate(date: Date): Promise<{
        message: string;
        stats: {
            orders: {
                pending: Quotation[];
                processing: Quotation[];
                completed: Quotation[];
                cancelled: Quotation[];
                postponed: Quotation[];
                outForDelivery: Quotation[];
                delivered: Quotation[];
                rejected: Quotation[];
                approved: Quotation[];
                metrics: {
                    totalOrders: number;
                    grossOrderValue: string;
                    averageOrderValue: string;
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
}
