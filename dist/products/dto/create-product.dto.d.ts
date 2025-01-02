export declare class CreateProductDto {
    name: string;
    description: string;
    image: string;
    price: number;
    salePrice: number;
    saleStart: Date;
    saleEnd: Date;
    discount: number;
    barcode: number;
    packageQuantity: number;
    category: string;
    brand: string;
    weight: number;
    reseller: {
        uid: number;
    };
    isOnPromotion: boolean;
}
