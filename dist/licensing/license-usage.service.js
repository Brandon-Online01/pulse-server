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
let LicenseUsageService = LicenseUsageService_1 = class LicenseUsageService {
    constructor(usageRepository, eventRepository) {
        this.usageRepository = usageRepository;
        this.eventRepository = eventRepository;
        this.logger = new common_1.Logger(LicenseUsageService_1.name);
        this.ALERT_THRESHOLD = 0.8;
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
                await this.createLimitExceededEvent(license, metricType, currentValue, limit)
                    .catch(error => this.logger.error(`Failed to create limit exceeded event: ${error.message}`));
            }
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to track usage: ${error.message}`, error.stack);
            return null;
        }
    }
    getLimitForMetric(license, metricType) {
        if (!license)
            return 0;
        try {
            switch (metricType) {
                case license_usage_entity_1.MetricType.USERS:
                    return license.maxUsers || 0;
                case license_usage_entity_1.MetricType.BRANCHES:
                    return license.maxBranches || 0;
                case license_usage_entity_1.MetricType.STORAGE:
                    return license.storageLimit || 0;
                case license_usage_entity_1.MetricType.API_CALLS:
                    return license.apiCallLimit || 0;
                case license_usage_entity_1.MetricType.INTEGRATIONS:
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
            const event = this.eventRepository.create({
                license,
                licenseId: String(license.uid),
                eventType: license_event_entity_1.LicenseEventType.LIMIT_EXCEEDED,
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
        Object.values(license_usage_entity_1.MetricType).forEach(metricType => {
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