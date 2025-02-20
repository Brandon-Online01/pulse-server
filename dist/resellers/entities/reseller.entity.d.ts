import { Product } from '../../products/entities/product.entity';
import { ResellerStatus } from '../../lib/enums/product.enums';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from 'src/branch/entities/branch.entity';
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
    isDeleted: boolean;
    address: string;
    products: Product[];
    organisation: Organisation;
    branch: Branch;
}
