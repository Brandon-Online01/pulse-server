export enum CompetitorStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ACQUIRED = 'acquired',
    BANKRUPT = 'bankrupt',
    MERGED = 'merged',
    POTENTIAL = 'potential',
    WATCHING = 'watching',
}

export enum CompetitorThreatLevel {
    VERY_LOW = 1,
    LOW = 2,
    MODERATE = 3,
    HIGH = 4,
    VERY_HIGH = 5,
}

export enum CompetitiveAdvantageLevel {
    VERY_WEAK = 1,
    WEAK = 2,
    MODERATE = 3,
    STRONG = 4,
    VERY_STRONG = 5,
}

export enum CompetitorPricingModel {
    SUBSCRIPTION = 'subscription',
    ONE_TIME = 'one_time',
    FREEMIUM = 'freemium',
    PER_USER = 'per_user',
    TIERED = 'tiered',
    USAGE_BASED = 'usage_based',
    HYBRID = 'hybrid',
}

export enum CompetitorType {
    DIRECT = 'direct',
    INDIRECT = 'indirect',
    POTENTIAL = 'potential',
}

export enum CompetitorSize {
    STARTUP = 'startup',
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
    ENTERPRISE = 'enterprise',
}

export enum GeofenceType {
    NONE = 'none',
    NOTIFY = 'notify',
    ALERT = 'alert',
    RESTRICTED = 'restricted',
} 