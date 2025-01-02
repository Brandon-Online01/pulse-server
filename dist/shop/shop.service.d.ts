import { Repository } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Order } from './entities/order.entity';
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
    private orderRepository;
    private bannersRepository;
    private readonly configService;
    private readonly clientsService;
    private readonly eventEmitter;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(productRepository: Repository<Product>, orderRepository: Repository<Order>, bannersRepository: Repository<Banners>, configService: ConfigService, clientsService: ClientsService, eventEmitter: EventEmitter2);
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
        orders: Order[];
        message: string;
    }>;
    getOrdersByUser(ref: number): Promise<{
        orders: Order[];
        message: string;
    }>;
    getOrderByRef(ref: number): Promise<{
        orders: Order;
        message: string;
    }>;
    getOrdersForDate(date: Date): Promise<{
        message: string;
        stats: {
            orders: {
                pending: Order[];
                processing: Order[];
                completed: Order[];
                cancelled: Order[];
                postponed: Order[];
                outForDelivery: Order[];
                delivered: Order[];
                rejected: Order[];
                approved: Order[];
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
