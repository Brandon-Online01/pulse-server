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
var LicenseUsageInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseUsageInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const license_usage_service_1 = require("./license-usage.service");
const licenses_1 = require("../lib/enums/licenses");
const licensing_service_1 = require("./licensing.service");
let LicenseUsageInterceptor = LicenseUsageInterceptor_1 = class LicenseUsageInterceptor {
    constructor(licenseUsageService, licensingService) {
        this.licenseUsageService = licenseUsageService;
        this.licensingService = licensingService;
        this.logger = new common_1.Logger(LicenseUsageInterceptor_1.name);
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const user = request['user'];
        if (!user?.licenseId) {
            return next.handle();
        }
        const startTime = Date.now();
        const path = request.path;
        const method = request.method;
        try {
            const license = await this.licensingService.findOne(user.licenseId);
            if (!license) {
                this.logger.warn(`No valid license found for user ${user.uid}`);
                return next.handle();
            }
            return next.handle().pipe((0, operators_1.tap)(async () => {
                try {
                    await this.licenseUsageService.trackUsage(license, licenses_1.MetricType.API_CALLS, 1, {
                        path,
                        method,
                        duration: Date.now() - startTime,
                        timestamp: new Date().toISOString(),
                        userId: user.uid,
                    });
                    if (request.file || request.files) {
                        const totalSize = this.calculateUploadSize(request.file || request.files);
                        if (totalSize > 0) {
                            await this.licenseUsageService.trackUsage(license, licenses_1.MetricType.STORAGE, totalSize, {
                                path,
                                method,
                                fileCount: Array.isArray(request.files) ? request.files.length : 1,
                                timestamp: new Date().toISOString(),
                                userId: user.uid,
                            });
                        }
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to track license usage: ${error.message}`, error.stack);
                }
            }));
        }
        catch (error) {
            this.logger.error(`Error in license interceptor: ${error.message}`, error.stack);
            return next.handle();
        }
    }
    calculateUploadSize(files) {
        if (!files)
            return 0;
        try {
            if (Array.isArray(files)) {
                return files.reduce((total, file) => {
                    return total + (file?.size || 0);
                }, 0);
            }
            return files?.size || 0;
        }
        catch (error) {
            this.logger.error(`Error calculating upload size: ${error.message}`);
            return 0;
        }
    }
};
exports.LicenseUsageInterceptor = LicenseUsageInterceptor;
exports.LicenseUsageInterceptor = LicenseUsageInterceptor = LicenseUsageInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [license_usage_service_1.LicenseUsageService,
        licensing_service_1.LicensingService])
], LicenseUsageInterceptor);
//# sourceMappingURL=license-usage.interceptor.js.map