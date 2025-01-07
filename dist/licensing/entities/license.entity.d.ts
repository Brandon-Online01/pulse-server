import { Organisation } from '../../organisation/entities/organisation.entity';
import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';
export declare class License {
    uid: string;
    licenseKey: string;
    type: LicenseType;
    plan: SubscriptionPlan;
    status: LicenseStatus;
    billingCycle: BillingCycle;
    maxUsers: number;
    maxBranches: number;
    storageLimit: number;
    apiCallLimit: number;
    integrationLimit: number;
    validFrom: Date;
    validUntil: Date;
    lastValidated: Date;
    isAutoRenew: boolean;
    price: number;
    features: Record<string, boolean>;
    organisation: Organisation;
    organisationRef: string;
    createdAt: Date;
    updatedAt: Date;
}
