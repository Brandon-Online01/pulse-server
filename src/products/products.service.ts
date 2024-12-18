import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository, In, Not, Like } from 'typeorm';
import { ProductStatus } from '../lib/enums/product.enums';
import { InjectRepository } from '@nestjs/typeorm';

export interface ShopBanner {
  uid: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

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

  async updateProduct(ref: number, updateProductDto: UpdateProductDto): Promise<{ message: string }> {
    try {
      const product = await this.productRepository.update(ref, updateProductDto);

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

  async deleteProduct(ref: number): Promise<{ message: string }> {
    try {
      const product = await this.productRepository.update(ref, { isDeleted: true });

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

  async restoreProduct(ref: number): Promise<{ message: string }> {
    try {
      const product = await this.productRepository.update(ref, { isDeleted: false });

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

  async getProductByref(ref: number): Promise<{ product: Product | null, message: string }> {
    try {
      const product = await this.productRepository.findOne({
        where: {
          uid: ref
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

  async productsBySearchTerm(searchTerm: string): Promise<{ products: Product[] | null, message: string }> {
    try {
      const searchPattern = `%${searchTerm?.toLowerCase()}%`;

      const products = await this.productRepository.find({
        where: [
          { category: Like(searchPattern) },
          { status: Like(searchTerm?.toLowerCase() as ProductStatus) }
        ]
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
}