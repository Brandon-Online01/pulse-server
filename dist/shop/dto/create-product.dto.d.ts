export declare class CreateProductDto {
    name: string;
    description?: string;
    price?: number;
    category?: string;
    imageUrl?: string;
    sku?: string;
    warehouseLocation?: string;
    stockQuantity?: number;
    productReferenceCode: string;
    reorderPoint?: number;
    reseller: {
        uid: number;
    };
}
