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
var LicensingNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicensingNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const licensing_service_1 = require("./licensing.service");
const license_enums_1 = require("../lib/enums/license.enums");
let LicensingNotificationsService = LicensingNotificationsService_1 = class LicensingNotificationsService {
    constructor(licensingService) {
        this.licensingService = licensingService;
        this.logger = new common_1.Logger(LicensingNotificationsService_1.name);
        this.NOTIFICATION_THRESHOLDS = [90, 60, 30, 15, 7];
    }
    async sendExpirationNotification(license, daysRemaining) {
        const message = this.getExpirationMessage(license, daysRemaining);
        this.logger.log(`Sending expiration notification for license ${license.licenseKey}: ${daysRemaining} days remaining`);
    }
    getExpirationMessage(license, daysRemaining) {
        if (daysRemaining <= 0) {
            return `Your license ${license.licenseKey} has expired. Please renew immediately to avoid service interruption.`;
        }
        if (daysRemaining <= 7) {
            return `URGENT: Your license ${license.licenseKey} will expire in ${daysRemaining} days. Please renew now to avoid service interruption.`;
        }
        if (daysRemaining <= 15) {
            return `Important: Your license ${license.licenseKey} will expire in ${daysRemaining} days. Please renew soon.`;
        }
        return `Your license ${license.licenseKey} will expire in ${daysRemaining} days. Consider renewing to ensure uninterrupted service.`;
    }
    async checkExpiringLicenses() {
        this.logger.log('Checking for expiring licenses...');
        for (const threshold of this.NOTIFICATION_THRESHOLDS) {
            const expiringLicenses = await this.licensingService.findExpiringLicenses(threshold);
            for (const license of expiringLicenses) {
                const daysRemaining = Math.ceil((license.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                await this.sendExpirationNotification(license, daysRemaining);
            }
        }
    }
    async checkGracePeriodLicenses() {
        this.logger.log('Checking grace period licenses...');
        const licenses = await this.licensingService.findAll();
        const gracePeriodLicenses = licenses.filter(license => license.status === license_enums_1.LicenseStatus.GRACE_PERIOD);
        for (const license of gracePeriodLicenses) {
            const daysRemaining = Math.ceil((license.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysRemaining <= 0) {
                await this.licensingService.update(String(license.uid), { status: license_enums_1.LicenseStatus.EXPIRED });
                await this.sendExpirationNotification(license, 0);
            }
        }
    }
    async checkLicenseUsage() {
        this.logger.log('Checking license usage...');
        const licenses = await this.licensingService.findAll();
        for (const license of licenses) {
            if (license.status !== license_enums_1.LicenseStatus.ACTIVE)
                continue;
        }
    }
};
exports.LicensingNotificationsService = LicensingNotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicensingNotificationsService.prototype, "checkExpiringLicenses", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicensingNotificationsService.prototype, "checkGracePeriodLicenses", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_NOON),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicensingNotificationsService.prototype, "checkLicenseUsage", null);
exports.LicensingNotificationsService = LicensingNotificationsService = LicensingNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [licensing_service_1.LicensingService])
], LicensingNotificationsService);
//# sourceMappingURL=licensing-notifications.service.js.map