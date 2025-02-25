import { ProductStatus } from '../../lib/enums/product.enums';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
    name: string;
    description: string;
    image: string;
    price: number;
    salePrice: number;
    discount: number;
    barcode: string;
    packageQuantity: number;
    category: string;
    weight: number;
    status: ProductStatus;
    reseller: {
        uid: number;
    };
}
export {};
