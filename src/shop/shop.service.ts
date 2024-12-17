import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopBanner } from 'src/products/products.service';
import { Product } from 'src/products/entities/product.entity';
import { ProductStatus } from 'src/lib/enums/enums';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async getBanners(): Promise<{ banners: ShopBanner[], message: string }> {
        try {
            const banners: ShopBanner[] = [
                {
                    uid: '1',
                    title: 'NEW',
                    subtitle: 'REWARDS',
                    description: 'JOIN OUR LOYALTY PROGRAM TODAY!',
                    image: `https://media.istockphoto.com/id/520410807/photo/cheeseburger.jpg?s=612x612&w=0&k=20&c=fG_OrCzR5HkJGI8RXBk76NwxxTasMb1qpTVlEM0oyg4=`,
                },
                {
                    uid: '2',
                    title: 'NEW',
                    subtitle: 'REWARDS',
                    description: 'JOIN OUR LOYALTY PROGRAM TODAY!',
                    image: `https://media.istockphoto.com/id/520410807/photo/cheeseburger.jpg?s=612x612&w=0&k=20&c=fG_OrCzR5HkJGI8RXBk76NwxxTasMb1qpTVlEM0oyg4=`,
                },
                {
                    uid: '3',
                    title: 'NEW',
                    subtitle: 'REWARDS',
                    description: 'JOIN OUR LOYALTY PROGRAM TODAY!',
                    image: `https://media.istockphoto.com/id/520410807/photo/cheeseburger.jpg?s=612x612&w=0&k=20&c=fG_OrCzR5HkJGI8RXBk76NwxxTasMb1qpTVlEM0oyg4=`,
                },
                {
                    uid: '4',
                    title: 'NEW',
                    subtitle: 'REWARDS',
                    description: 'JOIN OUR LOYALTY PROGRAM TODAY!',
                    image: `https://media.istockphoto.com/id/520410807/photo/cheeseburger.jpg?s=612x612&w=0&k=20&c=fG_OrCzR5HkJGI8RXBk76NwxxTasMb1qpTVlEM0oyg4=`,
                },
            ];

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

    async categories(): Promise<{ categories: string[] | null, message: string }> {
        try {
            const allProducts = await this.productRepository.find()

            if (!allProducts) {
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            }

            const categories = allProducts.map(product => product?.category);

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
            products: result.products,
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

}
