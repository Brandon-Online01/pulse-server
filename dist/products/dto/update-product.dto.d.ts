import { CreateProductDto } from './create-product.dto';
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
    name: string;
    description: string;
    image: string;
    price: number;
    salePrice: number;
    discount: number;
    barcode: number;
    packageQuantity: number;
    category: string;
    weight: number;
    reseller: {
        uid: number;
    };
    isOnPromotion: boolean;
}
export {};
