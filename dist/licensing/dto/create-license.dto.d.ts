import { LicenseType, SubscriptionPlan, BillingCycle } from '../../lib/enums/license.enums';
export declare class CreateLicenseDto {
    type: LicenseType;
    plan: SubscriptionPlan;
    billingCycle: BillingCycle;
    maxUsers: number;
    maxBranches: number;
    storageLimit: number;
    apiCallLimit: number;
    integrationLimit: number;
    validFrom: Date;
    validUntil: Date;
    isAutoRenew?: boolean;
    price: number;
    features?: Record<string, boolean>;
    organisationRef: string;
}
