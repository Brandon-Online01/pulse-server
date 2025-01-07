import { License } from './license.entity';
export declare enum LicenseEventType {
    CREATED = "created",
    RENEWED = "renewed",
    EXPIRED = "expired",
    SUSPENDED = "suspended",
    ACTIVATED = "activated",
    PLAN_CHANGED = "plan_changed",
    LIMIT_EXCEEDED = "limit_exceeded",
    GRACE_PERIOD_ENTERED = "grace_period_entered",
    GRACE_PERIOD_EXPIRED = "grace_period_expired",
    VALIDATION_FAILED = "validation_failed",
    FEATURE_ACCESS_DENIED = "feature_access_denied"
}
export declare class LicenseEvent {
    uid: string;
    license: License;
    licenseId: string;
    eventType: LicenseEventType;
    details: Record<string, any>;
    userId: string;
    userIp: string;
    userAgent: string;
    timestamp: Date;
}
