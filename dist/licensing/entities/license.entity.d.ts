import { BaseEntity } from '../../lib/entities/base.entity';
import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';
import { Organisation } from '../../organisation/entities/organisation.entity';
export declare class License extends BaseEntity {
    licenseKey: string;
    type: LicenseType;
    plan: SubscriptionPlan;
    status: LicenseStatus;
    billingCycle: BillingCycle;
    validUntil: Date;
    lastValidated?: Date;
    maxUsers: number;
    maxBranches: number;
    storageLimit: number;
    apiCallLimit: number;
    integrationLimit: number;
    features: Record<string, boolean>;
    price: number;
    organisationRef: number;
    hasPendingPayments: boolean;
    organisation: Organisation;
}
