import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Order } from './entities/order.entity';
import { Banners } from './entities/banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ProductStatus } from 'src/lib/enums/product.enums';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Banners)
        private bannersRepository: Repository<Banners>,
    ) { }

    //shopping
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

    async checkout(orderItems: CheckoutDto): Promise<{ message: string }> {
        try {
            if (!orderItems?.items?.length) {
                throw new Error('Order items are required');
            }

            if (!orderItems?.owner?.uid) {
                throw new Error('Owner is required');
            }

            if (!orderItems?.client?.uid) {
                throw new Error('Client is required');
            }

            const newOrder = this.orderRepository.create({
                orderNumber: `ORD-${Date.now()}`,
                totalItems: orderItems?.totalItems,
                totalAmount: orderItems?.totalAmount,
                placedBy: orderItems?.owner?.uid ? { uid: orderItems?.owner?.uid } : null,
                client: orderItems?.client?.uid ? { uid: orderItems?.client?.uid } : null,
                orderItems: orderItems?.items?.map(item => ({
                    quantity: item?.quantity,
                    product: { uid: item?.uid },
                    totalPrice: item?.totalPrice,
                }))
            });

            await this.orderRepository.save(newOrder);

            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };

            console.log(error, ' response');

            return response;
        }
    }

    //shop banners
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
                throw new Error('Banner not found');
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
                throw new Error('Banner not found');
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

    //orders
    async getAllOrders(): Promise<{ orders: Order[], message: string }> {
        try {
            const orders = await this.orderRepository.find({
                relations: ['placedBy', 'client', 'orderItems']
            });

            if (!orders) {
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            }

            const response = {
                orders,
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        } catch (error) {
            const response = {
                message: error?.message,
                orders: []
            }

            return response;
        }
    }

    async getOrdersByUser(ref: number): Promise<{ orders: Order[], message: string }> {
        try {
            const orders = await this.orderRepository.find({
                where: {
                    placedBy: {
                        uid: ref
                    }
                },
                relations: ['placedBy', 'client', 'orderItems']
            });

            if (!orders) {
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            }

            const response = {
                orders,
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        } catch (error) {
            const response = {
                message: error?.message,
                orders: []
            }

            return response;
        }
    }

    async getOrderByRef(ref: number): Promise<{ orders: Order, message: string }> {
        try {
            const orders = await this.orderRepository.findOne({
                where: {
                    uid: ref
                },
                relations: ['placedBy', 'client', 'orderItems', 'orderItems.product']
            });

            if (!orders) {
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            }

            const response = {
                orders,
                message: process.env.SUCCESS_MESSAGE,
            };

            return response;
        } catch (error) {
            const response = {
                message: error?.message,
                orders: null
            }

            return response;
        }
    }
}
