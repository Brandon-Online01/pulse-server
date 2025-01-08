import { BannerCategory } from "src/lib/enums/category.enum";
export declare class Banners {
    uid: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    category: BannerCategory;
}
