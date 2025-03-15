"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LicenseUsageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseUsageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const license_usage_entity_1 = require("./entities/license-usage.entity");
const license_event_entity_1 = require("./entities/license-event.entity");
const licenses_1 = require("../lib/enums/licenses");
let LicenseUsageService = LicenseUsageService_1 = class LicenseUsageService {
    constructor(usageRepository, eventRepository) {
        this.usageRepository = usageRepository;
        this.eventRepository = eventRepository;
        this.logger = new common_1.Logger(LicenseUsageService_1.name);
        this.ALERT_THRESHOLD = 0.8;
        this.AGGREGATION_INTERVAL = 1000 * 60 * 5;
        this.usageBuffer = new Map();
        setInterval(() => this.processBufferedUsage(), this.AGGREGATION_INTERVAL);
    }
    async trackUsage(license, metricType, currentValue, metadata) {
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
            if (metricType === licenses_1.MetricType.API_CALLS) {
                return this.handleAPIUsage(license, currentValue, metadata);
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
            if (utilizationPercentage >= this.ALERT_THRESHOLD * 100) {
                await this.createLimitExceededEvent(license, metricType, currentValue, limit);
            }
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to track usage: ${error.message}`, error.stack);
            return null;
        }
    }
    async handleAPIUsage(license, callCount, metadata) {
        const bufferKey = `${license.uid}_${licenses_1.MetricType.API_CALLS}`;
        let buffer = this.usageBuffer.get(bufferKey) || [];
        buffer.push({
            timestamp: new Date(),
            endpoint: metadata.endpoint,
            method: metadata.method,
            duration: metadata.duration,
            statusCode: metadata.statusCode,
            userAgent: metadata.userAgent,
            ip: metadata.ip,
            geoLocation: metadata.geoLocation
        });
        this.usageBuffer.set(bufferKey, buffer);
        if (buffer.length >= 100) {
            return this.processBufferedUsage(license);
        }
        return null;
    }
    async processBufferedUsage(specificLicense) {
        try {
            for (const [key, buffer] of this.usageBuffer.entries()) {
                if (specificLicense && !key.startsWith(String(specificLicense?.uid)))
                    continue;
                const [licenseId] = key.split('_');
                if (!buffer.length)
                    continue;
                const latestUsage = await this.usageRepository.findOne({
                    where: {
                        licenseId,
                        metricType: licenses_1.MetricType.API_CALLS
                    },
                    order: { timestamp: 'DESC' }
                });
                const aggregatedMetadata = this.aggregateAPIUsage(buffer, latestUsage?.metadata);
                const totalCalls = (latestUsage?.currentValue || 0) + buffer.length;
                const license = specificLicense || latestUsage?.license;
                const limit = this.getLimitForMetric(license, licenses_1.MetricType.API_CALLS);
                if (!limit || limit <= 0) {
                    this.logger.warn(`Invalid API call limit (${limit}) for license ${licenseId}. Skipping usage update.`);
                    continue;
                }
                const utilizationPercentage = Number(((totalCalls / limit) * 100).toFixed(2));
                const usage = this.usageRepository.create({
                    license,
                    licenseId: licenseId,
                    metricType: licenses_1.MetricType.API_CALLS,
                    currentValue: totalCalls,
                    limit,
                    utilizationPercentage,
                    metadata: aggregatedMetadata
                });
                const saved = await this.usageRepository.save(usage);
                this.usageBuffer.set(key, []);
                if (utilizationPercentage >= this.ALERT_THRESHOLD * 100) {
                    await this.createLimitExceededEvent(license, licenses_1.MetricType.API_CALLS, totalCalls, limit);
                }
                return saved;
            }
        }
        catch (error) {
            this.logger.error(`Failed to process buffered usage: ${error.message}`, error.stack);
        }
        return null;
    }
    aggregateAPIUsage(buffer, existingMetadata = {}) {
        const metadata = {
            endpoints: existingMetadata?.endpoints || {},
            methods: existingMetadata?.methods || {},
            statusCodes: existingMetadata?.statusCodes || {},
            performance: {
                averageResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: Number.MAX_VALUE,
                p95ResponseTime: 0,
                errorRate: 0
            },
            clients: {
                browsers: existingMetadata?.clients?.browsers || {},
                os: existingMetadata?.clients?.os || {},
                devices: existingMetadata?.clients?.devices || {},
                locations: existingMetadata?.clients?.locations || {}
            },
            timeDistribution: {
                hourly: new Array(24).fill(0),
                daily: new Array(7).fill(0),
                monthly: new Array(12).fill(0)
            }
        };
        let totalDuration = 0;
        let errorCount = 0;
        const durations = [];
        buffer.forEach(call => {
            metadata.endpoints[call.endpoint] = (metadata.endpoints[call.endpoint] || 0) + 1;
            metadata.methods[call.method] = (metadata.methods[call.method] || 0) + 1;
            metadata.statusCodes[call.statusCode] = (metadata.statusCodes[call.statusCode] || 0) + 1;
            totalDuration += call.duration;
            durations.push(call.duration);
            metadata.performance.maxResponseTime = Math.max(metadata.performance.maxResponseTime, call.duration);
            metadata.performance.minResponseTime = Math.min(metadata.performance.minResponseTime, call.duration);
            if (call.statusCode >= 400)
                errorCount++;
            if (call.userAgent) {
                metadata.clients.browsers[call.userAgent.browser] =
                    (metadata.clients.browsers[call.userAgent.browser] || 0) + 1;
                metadata.clients.os[call.userAgent.os] =
                    (metadata.clients.os[call.userAgent.os] || 0) + 1;
                metadata.clients.devices[call.userAgent.device] =
                    (metadata.clients.devices[call.userAgent.device] || 0) + 1;
            }
            if (call.geoLocation?.country) {
                metadata.clients.locations[call.geoLocation.country] =
                    (metadata.clients.locations[call.geoLocation.country] || 0) + 1;
            }
            const date = new Date(call.timestamp);
            metadata.timeDistribution.hourly[date.getHours()]++;
            metadata.timeDistribution.daily[date.getDay()]++;
            metadata.timeDistribution.monthly[date.getMonth()]++;
        });
        metadata.performance.averageResponseTime = totalDuration / buffer.length;
        metadata.performance.errorRate = (errorCount / buffer.length) * 100;
        durations.sort((a, b) => a - b);
        const p95Index = Math.floor(durations.length * 0.95);
        metadata.performance.p95ResponseTime = durations[p95Index] || 0;
        return metadata;
    }
    getLimitForMetric(license, metricType) {
        if (!license)
            return 0;
        try {
            switch (metricType) {
                case licenses_1.MetricType.USERS:
                    return license.maxUsers || 0;
                case licenses_1.MetricType.BRANCHES:
                    return license.maxBranches || 0;
                case licenses_1.MetricType.STORAGE:
                    return license.storageLimit || 0;
                case licenses_1.MetricType.API_CALLS:
                    return license.apiCallLimit || 0;
                case licenses_1.MetricType.INTEGRATIONS:
                    return license.integrationLimit || 0;
                default:
                    this.logger.warn(`Unknown metric type: ${metricType}`);
                    return 0;
            }
        }
        catch (error) {
            this.logger.error(`Error getting limit for metric ${metricType}: ${error.message}`);
            return 0;
        }
    }
    async createLimitExceededEvent(license, metricType, currentValue, limit) {
        try {
            if (!license?.uid) {
                throw new Error('Invalid license object');
            }
            if (!limit || limit <= 0) {
                throw new Error(`Invalid limit (${limit}) for metric ${metricType}`);
            }
            const utilizationPercentage = Number(((currentValue / limit) * 100).toFixed(2));
            const event = this.eventRepository.create({
                license,
                licenseId: license.uid.toString(),
                eventType: license_event_entity_1.LicenseEventType.LIMIT_EXCEEDED,
                details: {
                    metricType,
                    currentValue,
                    limit,
                    utilizationPercentage,
                    timestamp: new Date().toISOString()
                },
            });
            await this.eventRepository.save(event);
            this.logger.warn(`License ${license.licenseKey} exceeded ${metricType} limit: ${currentValue}/${limit}`);
        }
        catch (error) {
            throw new Error(`Failed to create limit exceeded event: ${error.message}`);
        }
    }
    async getUsageHistory(licenseId, metricType, startDate, endDate) {
        return this.usageRepository.find({
            where: {
                licenseId,
                metricType,
                timestamp: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { timestamp: 'ASC' },
        });
    }
    async getUsageAnalytics(licenseId) {
        const usage = await this.usageRepository.find({
            where: { licenseId },
            order: { timestamp: 'DESC' },
        });
        const analytics = {};
        Object.values(licenses_1.MetricType).forEach(metricType => {
            const latestUsage = usage?.find(u => u?.metricType === metricType);
            analytics[metricType] = latestUsage ? latestUsage?.utilizationPercentage : 0;
        });
        return analytics;
    }
    async getLicenseEvents(licenseId, startDate, endDate) {
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
    async createEvent(license, eventType, details, userId, userIp, userAgent) {
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
    async getComplianceReport(licenseId) {
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
};
exports.LicenseUsageService = LicenseUsageService;
exports.LicenseUsageService = LicenseUsageService = LicenseUsageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(license_usage_entity_1.LicenseUsage)),
    __param(1, (0, typeorm_1.InjectRepository)(license_event_entity_1.LicenseEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LicenseUsageService);
//# sourceMappingURL=license-usage.service.js.map