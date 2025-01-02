import { ProductStatus } from "../../lib/enums/product.enums";
export declare class CreateBannerDto {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    category: ProductStatus;
}
