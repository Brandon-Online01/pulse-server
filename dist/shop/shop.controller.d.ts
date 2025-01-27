import { ShopService } from './shop.service';
import { Product } from '../products/entities/product.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
export declare class ShopController {
    private readonly shopService;
    constructor(shopService: ShopService);
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
    categories(): Promise<{
        categories: string[] | null;
        message: string;
    }>;
    specials(): Promise<{
        products: Product[] | null;
        message: string;
    }>;
    checkout(items: CheckoutDto): Promise<{
        message: string;
    }>;
    getQuotations(): Promise<{
        quotations: import("./entities/quotation.entity").Quotation[];
        message: string;
    }>;
    getQuotationByRef(ref: number): Promise<{
        quotation: import("./entities/quotation.entity").Quotation;
        message: string;
    }>;
    getQuotationsByUser(ref: number): Promise<{
        quotations: import("./entities/quotation.entity").Quotation[];
        message: string;
    }>;
    getBanner(): Promise<{
        banners: import("./entities/banners.entity").Banners[];
        message: string;
    }>;
    createBanner(bannerData: CreateBannerDto): Promise<{
        banner: import("./entities/banners.entity").Banners | null;
        message: string;
    }>;
    updateBanner(ref: number, bannerData: UpdateBannerDto): Promise<{
        banner: import("./entities/banners.entity").Banners | null;
        message: string;
    }>;
    deleteBanner(ref: number): Promise<{
        message: string;
    }>;
    generateMissingSKUs(): Promise<{
        message: string;
        updatedCount: number;
    }>;
    regenerateAllSKUs(): Promise<{
        message: string;
        updatedCount: number;
    }>;
}
