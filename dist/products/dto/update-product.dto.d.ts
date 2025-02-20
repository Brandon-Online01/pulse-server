import { ProductStatus } from '../../lib/enums/product.enums';
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    salePrice?: number;
    discount?: number;
    barcode?: string;
    packageQuantity?: number;
    brand?: string;
    weight?: number;
    stockQuantity?: number;
    sku?: string;
    status?: ProductStatus;
    imageUrl?: string;
    warehouseLocation?: string;
    productReferenceCode?: string;
    reorderPoint?: number;
    isOnPromotion?: boolean;
    packageDetails?: string;
    productRef?: string;
    isDeleted?: boolean;
    promotionStartDate?: Date;
    promotionEndDate?: Date;
    packageUnit?: string;
}
