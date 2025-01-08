import { Repository } from 'typeorm';
import { LicenseUsage, MetricType } from './entities/license-usage.entity';
import { LicenseEvent, LicenseEventType } from './entities/license-event.entity';
import { License } from './entities/license.entity';
export declare class LicenseUsageService {
    private readonly usageRepository;
    private readonly eventRepository;
    private readonly logger;
    private readonly ALERT_THRESHOLD;
    constructor(usageRepository: Repository<LicenseUsage>, eventRepository: Repository<LicenseEvent>);
    trackUsage(license: License, metricType: MetricType, currentValue: number, metadata?: Record<string, any>): Promise<LicenseUsage | null>;
    private getLimitForMetric;
    private createLimitExceededEvent;
    getUsageHistory(licenseId: string, metricType: MetricType, startDate: Date, endDate: Date): Promise<LicenseUsage[]>;
    getUsageAnalytics(licenseId: string): Promise<Record<MetricType, number>>;
    getLicenseEvents(licenseId: string, startDate?: Date, endDate?: Date): Promise<LicenseEvent[]>;
    createEvent(license: License, eventType: LicenseEventType, details: Record<string, any>, userId?: string, userIp?: string, userAgent?: string): Promise<LicenseEvent>;
    getComplianceReport(licenseId: string): Promise<any>;
}
