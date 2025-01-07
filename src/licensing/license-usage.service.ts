import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LicenseUsage, MetricType } from './entities/license-usage.entity';
import { LicenseEvent, LicenseEventType } from './entities/license-event.entity';
import { License } from './entities/license.entity';

@Injectable()
export class LicenseUsageService {
    private readonly logger = new Logger(LicenseUsageService.name);
    private readonly ALERT_THRESHOLD = 0.8; // 80% utilization alert

    constructor(
        @InjectRepository(LicenseUsage)
        private readonly usageRepository: Repository<LicenseUsage>,
        @InjectRepository(LicenseEvent)
        private readonly eventRepository: Repository<LicenseEvent>,
    ) { }

    async trackUsage(
        license: License,
        metricType: MetricType,
        currentValue: number,
        metadata?: Record<string, any>
    ): Promise<LicenseUsage> {
        const limit = this.getLimitForMetric(license, metricType);
        const utilizationPercentage = (currentValue / limit) * 100;

        const usage = this.usageRepository.create({
            license,
            licenseId: String(license?.uid),
            metricType,
            currentValue,
            limit,
            utilizationPercentage,
            metadata,
        });

        const saved = await this.usageRepository.save(usage);

        // Check if we need to create an event for limit exceeded
        if (utilizationPercentage >= this.ALERT_THRESHOLD * 100) {
            await this.createLimitExceededEvent(license, metricType, currentValue, limit);
        }

        return saved;
    }

    private getLimitForMetric(license: License, metricType: MetricType): number {
        switch (metricType) {
            case MetricType.USERS:
                return license?.maxUsers;
            case MetricType.BRANCHES:
                return license?.maxBranches;
            case MetricType.STORAGE:
                return license?.storageLimit;
            case MetricType.API_CALLS:
                return license?.apiCallLimit;
            case MetricType.INTEGRATIONS:
                return license?.integrationLimit;
            default:
                throw new Error(`Unknown metric type: ${metricType}`);
        }
    }

    private async createLimitExceededEvent(
        license: License,
        metricType: MetricType,
        currentValue: number,
        limit: number
    ): Promise<void> {
        const event = this.eventRepository.create({
            license,
            licenseId: String(license?.uid),
            eventType: LicenseEventType.LIMIT_EXCEEDED,
            details: {
                metricType,
                currentValue,
                limit,
                utilizationPercentage: (currentValue / limit) * 100,
            },
        });

        await this.eventRepository.save(event);
        this.logger.warn(`License ${license.licenseKey} exceeded ${metricType} limit: ${currentValue}/${limit}`);
    }

    async getUsageHistory(
        licenseId: string,
        metricType: MetricType,
        startDate: Date,
        endDate: Date
    ): Promise<LicenseUsage[]> {
        return this.usageRepository.find({
            where: {
                licenseId,
                metricType,
                timestamp: Between(startDate, endDate),
            },
            order: { timestamp: 'ASC' },
        });
    }

    async getUsageAnalytics(licenseId: string): Promise<Record<MetricType, number>> {
        const usage = await this.usageRepository.find({
            where: { licenseId },
            order: { timestamp: 'DESC' },
        });

        const analytics: Partial<Record<MetricType, number>> = {};

        Object.values(MetricType).forEach(metricType => {
            const latestUsage = usage?.find(u => u?.metricType === metricType);
            analytics[metricType] = latestUsage ? latestUsage?.utilizationPercentage : 0;
        });

        return analytics as Record<MetricType, number>;
    }

    async getLicenseEvents(
        licenseId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<LicenseEvent[]> {
        const query = this.eventRepository.createQueryBuilder('event')
            .where('event.licenseId = :licenseId', { licenseId });

        if (startDate && endDate) {
            query.andWhere('event.timestamp BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        return query.orderBy('event.timestamp', 'DESC').getMany();
    }

    async createEvent(
        license: License,
        eventType: LicenseEventType,
        details: Record<string, any>,
        userId?: string,
        userIp?: string,
        userAgent?: string
    ): Promise<LicenseEvent> {
        const event = this.eventRepository.create({
            license,
            licenseId: String(license?.uid),
            eventType,
            details,
            userId,
            userIp,
            userAgent,
        });

        return this.eventRepository.save(event);
    }

    async getComplianceReport(licenseId: string): Promise<any> {
        const [events, usage] = await Promise.all([
            this.getLicenseEvents(licenseId),
            this.getUsageAnalytics(licenseId),
        ]);

        return {
            licenseId,
            usage,
            events: events.map(event => ({
                type: event?.eventType,
                timestamp: event?.timestamp,
                details: event?.details,
            })),
            generatedAt: new Date(),
        };
    }
} 