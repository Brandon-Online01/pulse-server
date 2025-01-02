import { CreateAssetDto } from './create-asset.dto';
declare const UpdateAssetDto_base: import("@nestjs/common").Type<Partial<CreateAssetDto>>;
export declare class UpdateAssetDto extends UpdateAssetDto_base {
    brand?: string;
    serialNumber?: string;
    modelNumber?: string;
    purchaseDate?: Date;
    hasInsurance?: boolean;
    insuranceProvider?: string;
    insuranceExpiryDate?: Date;
    owner?: {
        uid: number;
    };
    branch?: {
        uid: number;
    };
}
export {};
