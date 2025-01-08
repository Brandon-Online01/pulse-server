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
    ): Promise<LicenseUsage | null> {
        try {
            if (!license?.uid) {
                this.logger.error('Invalid license object provided to trackUsage');
                return null;
            }

            const limit = this.getLimitForMetric(license, metricType);
            if (typeof limit !== 'number' || isNaN(limit) || limit <= 0) {
                this.logger.warn(`Invalid limit (${limit}) for metric ${metricType} in license ${license.uid}`);
                return null;
            }

            const utilizationPercentage = Number(((currentValue / limit) * 100).toFixed(2));
            if (isNaN(utilizationPercentage)) {
                this.logger.error(`Invalid utilization calculation: ${currentValue} / ${limit}`);
                return null;
            }

            const usage = this.usageRepository.create({
                license,
                licenseId: String(license.uid),
                metricType,
                currentValue,
                limit,
                utilizationPercentage,
                metadata: metadata || {},
            });

            const saved = await this.usageRepository.save(usage);

            // Check if we need to create an event for limit exceeded
            if (utilizationPercentage >= this.ALERT_THRESHOLD * 100) {
                await this.createLimitExceededEvent(license, metricType, currentValue, limit)
                    .catch(error => this.logger.error(`Failed to create limit exceeded event: ${error.message}`));
            }

            return saved;
        } catch (error) {
            this.logger.error(`Failed to track usage: ${error.message}`, error.stack);
            return null;
        }
    }

    private getLimitForMetric(license: License, metricType: MetricType): number {
        if (!license) return 0;

        try {
            switch (metricType) {
                case MetricType.USERS:
                    return license.maxUsers || 0;
                case MetricType.BRANCHES:
                    return license.maxBranches || 0;
                case MetricType.STORAGE:
                    return license.storageLimit || 0;
                case MetricType.API_CALLS:
                    return license.apiCallLimit || 0;
                case MetricType.INTEGRATIONS:
                    return license.integrationLimit || 0;
                default:
                    this.logger.warn(`Unknown metric type: ${metricType}`);
                    return 0;
            }
        } catch (error) {
            this.logger.error(`Error getting limit for metric ${metricType}: ${error.message}`);
            return 0;
        }
    }

    private async createLimitExceededEvent(
        license: License,
        metricType: MetricType,
        currentValue: number,
        limit: number
    ): Promise<void> {
        try {
            if (!license?.uid) {
                throw new Error('Invalid license object');
            }

            const event = this.eventRepository.create({
                license,
                licenseId: String(license.uid),
                eventType: LicenseEventType.LIMIT_EXCEEDED,
                details: {
                    metricType,
                    currentValue,
                    limit,
                    utilizationPercentage: Number(((currentValue / limit) * 100).toFixed(2)),
                    timestamp: new Date().toISOString()
                },
            });

            await this.eventRepository.save(event);
            this.logger.warn(`License ${license.licenseKey} exceeded ${metricType} limit: ${currentValue}/${limit}`);
        } catch (error) {
            throw new Error(`Failed to create limit exceeded event: ${error.message}`);
        }
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