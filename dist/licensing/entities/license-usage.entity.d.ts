import { License } from './license.entity';
import { MetricType } from '../../lib/enums/licenses';
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
