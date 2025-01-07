import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';
export declare class UpdateLicenseDto {
    type?: LicenseType;
    plan?: SubscriptionPlan;
    status?: LicenseStatus;
    billingCycle?: BillingCycle;
    maxUsers?: number;
    maxBranches?: number;
    storageLimit?: number;
    apiCallLimit?: number;
    integrationLimit?: number;
    validFrom?: Date;
    validUntil?: Date;
    isAutoRenew?: boolean;
    price?: number;
    features?: Record<string, boolean>;
}
