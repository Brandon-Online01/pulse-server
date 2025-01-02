import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQuery } from '../lib/interfaces/product.interfaces';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    createProduct(createProductDto: CreateProductDto): Promise<{
        product: import("./entities/product.entity").Product | null;
        message: string;
    }>;
    products(query: PaginationQuery): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/product.entity").Product>>;
    getProductByref(ref: number): Promise<{
        product: import("./entities/product.entity").Product | null;
        message: string;
    }>;
    productsBySearchTerm(category: string): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/product.entity").Product>>;
    updateProduct(ref: number, updateProductDto: UpdateProductDto): Promise<{
        message: string;
    }>;
    restoreProduct(ref: number): Promise<{
        message: string;
    }>;
    deleteProduct(ref: number): Promise<{
        message: string;
    }>;
}
