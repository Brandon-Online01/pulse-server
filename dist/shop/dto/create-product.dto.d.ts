export declare class CreateProductDto {
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
}
