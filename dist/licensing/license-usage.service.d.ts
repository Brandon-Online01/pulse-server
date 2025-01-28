import { Repository } from 'typeorm';
import { LicenseUsage } from './entities/license-usage.entity';
import { LicenseEvent, LicenseEventType } from './entities/license-event.entity';
import { License } from './entities/license.entity';
import { MetricType } from '../lib/enums/licenses';
export declare class LicenseUsageService {
    private readonly usageRepository;
    private readonly eventRepository;
    private readonly logger;
    private readonly ALERT_THRESHOLD;
    private readonly AGGREGATION_INTERVAL;
    private usageBuffer;
    constructor(usageRepository: Repository<LicenseUsage>, eventRepository: Repository<LicenseEvent>);
    trackUsage(license: License, metricType: MetricType, currentValue: number, metadata?: Record<string, any>): Promise<LicenseUsage | null>;
    private handleAPIUsage;
    private processBufferedUsage;
    private aggregateAPIUsage;
    private getLimitForMetric;
    private createLimitExceededEvent;
    getUsageHistory(licenseId: string, metricType: MetricType, startDate: Date, endDate: Date): Promise<LicenseUsage[]>;
    getUsageAnalytics(licenseId: string): Promise<Record<MetricType, number>>;
    getLicenseEvents(licenseId: string, startDate?: Date, endDate?: Date): Promise<LicenseEvent[]>;
    createEvent(license: License, eventType: LicenseEventType, details: Record<string, any>, userId?: string, userIp?: string, userAgent?: string): Promise<LicenseEvent>;
    getComplianceReport(licenseId: string): Promise<any>;
}
