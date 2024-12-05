import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { Reseller } from '../resellers/entities/reseller.entity';
import { Branch } from '../branch/entities/branch.entity';
import { ProductStatus } from 'src/lib/enums/enums';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-shop.dto';

@Injectable()
export class ShopService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@InjectRepository(Order)
		private orderRepository: Repository<Order>,
		@InjectRepository(Reseller)
		private resellerRepository: Repository<Reseller>,
		@InjectRepository(Branch)
		private branchRepository: Repository<Branch>
	) { }

	async availableBuyers(): Promise<{ branches: Branch[] | null, message: string }> {
		try {
			const availableBuyers = await this.branchRepository.find();

			if (!availableBuyers) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				branches: availableBuyers,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				branches: null
			}

			return response;
		}
	}

	async bannerHighlights() {
		return `This action returns all banner highlights`;
	}

	//orders
	async orders() {
		return `This action returns all orders`;
	}

	//products
	async createProduct(createProductDto: CreateProductDto): Promise<{ product: Product | null, message: string }> {
		try {
			const product = await this.productRepository.save(createProductDto);

			if (!product) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				product: product,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				product: null
			}

			return response;
		}
	}

	async updateProduct(referenceCode: number, updateProductDto: UpdateProductDto): Promise<{ message: string }> {
		try {
			const product = await this.productRepository.update(referenceCode, updateProductDto);

			if (!product) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async deleteProduct(referenceCode: number): Promise<{ message: string }> {
		try {
			const product = await this.productRepository.update(referenceCode, { isDeleted: true });

			if (!product) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async restoreProduct(referenceCode: number): Promise<{ message: string }> {
		try {
			const product = await this.productRepository.update(referenceCode, { isDeleted: false });

			if (!product) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
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

			const response = {
				categories: categories,
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

	async specials(): Promise<{ products: Product[] | null, message: string }> {
		try {
			const products = await this.productRepository.find({
				where: {
					status: In([ProductStatus.SPECIAL, ProductStatus.PROMOTIONAL, ProductStatus.BEST_SELLER, ProductStatus.DISCOUNTED])
				}
			});

			if (!products) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				products: products,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				products: null
			}

			return response;
		}
	}

	async products(): Promise<{ products: Product[] | null, message: string }> {
		try {
			const products = await this.productRepository.find({
				where: {
					status: Not(In([ProductStatus.DISCONTINUED, ProductStatus.HIDDEN]))
				}
			});

			if (!products) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				products: products,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				products: null
			}

			return response;
		}
	}

	async getProductByReferenceCode(referenceCode: number): Promise<{ product: Product | null, message: string }> {
		try {
			const product = await this.productRepository.findOne({
				where: {
					uid: referenceCode
				}
			});

			if (!product) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				product: product,
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				product: null
			}

			return response;
		}
	}
}
