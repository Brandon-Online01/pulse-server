export interface ILicenseMetrics {
    maxUsers: number;
    maxBranches: number;
    storageLimit: number;
    apiCallLimit: number;
    integrationLimit: number;
}

export interface ILicenseValidation {
    isValid: boolean;
    reason?: string;
    metrics?: {
        [K in keyof ILicenseMetrics]?: {
            current: number;
            limit: number;
            isExceeded: boolean;
        };
    };
} 