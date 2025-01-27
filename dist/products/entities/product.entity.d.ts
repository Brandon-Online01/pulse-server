import { ProductStatus } from '../../lib/enums/product.enums';
import { QuotationItem } from '../../shop/entities/quotation-item.entity';
import { Reseller } from '../../resellers/entities/reseller.entity';
export declare class Product {
    uid: number;
    name: string;
    description: string;
    price: number;
    category: string;
    status: ProductStatus;
    imageUrl: string;
    sku: string;
    warehouseLocation: string;
    stockQuantity: number;
    reorderPoint: number;
    createdAt: Date;
    updatedAt: Date;
    quotationItems: QuotationItem[];
    reseller: Reseller;
    isDeleted: boolean;
    static generateSKU(category: string, name: string, uid: number, reseller: Reseller): string;
    generateSKUBeforeInsert(): Promise<void>;
    updateSKUWithCorrectUid(): Promise<void>;
}
