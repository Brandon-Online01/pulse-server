import { LicenseType, SubscriptionPlan, BillingCycle } from '../../lib/enums/license.enums';
import { ILicenseMetrics } from '../lib/interfaces/license-metrics.interface';
export declare class CreateLicenseDto implements Partial<ILicenseMetrics> {
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
