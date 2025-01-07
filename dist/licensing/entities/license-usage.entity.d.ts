import { License } from './license.entity';
export declare enum MetricType {
    USERS = "users",
    BRANCHES = "branches",
    STORAGE = "storage",
    API_CALLS = "api_calls",
    INTEGRATIONS = "integrations"
}
export declare class LicenseUsage {
    uid: string;
    license: License;
    licenseId: string;
    metricType: MetricType;
    currentValue: number;
    limit: number;
    utilizationPercentage: number;
    metadata: Record<string, any>;
    timestamp: Date;
}
