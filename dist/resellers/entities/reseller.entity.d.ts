import { Product } from "../../products/entities/product.entity";
import { ResellerStatus } from "../../lib/enums/product.enums";
export declare class Reseller {
    uid: number;
    name: string;
    description: string;
    logo: string;
    website: string;
    status: ResellerStatus;
    contactPerson: string;
    phone: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    products: Product[];
    isDeleted: boolean;
    address: string;
}
