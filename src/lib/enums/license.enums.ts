export enum LicenseType {
    PERPETUAL = 'perpetual',
    SUBSCRIPTION = 'subscription',
    TRIAL = 'trial',
    ENTERPRISE = 'enterprise'
}

export enum SubscriptionPlan {
    STARTER = 'starter',
    PROFESSIONAL = 'professional',
    BUSINESS = 'business',
    ENTERPRISE = 'enterprise'
}

export enum LicenseStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    SUSPENDED = 'suspended',
    GRACE_PERIOD = 'grace_period',
    TRIAL = 'trial'
}

export enum BillingCycle {
    MONTHLY = 'monthly',
    ANNUAL = 'annual',
    CUSTOM = 'custom'
} 