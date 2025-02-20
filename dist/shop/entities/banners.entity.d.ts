import { Branch } from "src/branch/entities/branch.entity";
import { BannerCategory } from "src/lib/enums/category.enum";
import { Organisation } from "src/organisation/entities/organisation.entity";
export declare class Banners {
    uid: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    category: BannerCategory;
    organisation: Organisation;
    branch: Branch;
}
