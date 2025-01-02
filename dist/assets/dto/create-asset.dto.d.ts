export declare class CreateAssetDto {
    brand: string;
    serialNumber: string;
    modelNumber: string;
    purchaseDate: Date;
    hasInsurance: boolean;
    insuranceProvider: string;
    insuranceExpiryDate: Date;
    owner: {
        uid: number;
    };
    branch: {
        uid: number;
    };
}
