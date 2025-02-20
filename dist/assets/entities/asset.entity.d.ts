import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { User } from '../../user/entities/user.entity';
export declare class Asset {
    uid: number;
    brand: string;
    serialNumber: string;
    modelNumber: string;
    purchaseDate: Date;
    createdAt: Date;
    hasInsurance: boolean;
    insuranceProvider: string;
    insuranceExpiryDate: Date;
    isDeleted: boolean;
    owner: User;
    organisation: Organisation;
    branch: Branch;
}
