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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseUsageInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const license_usage_service_1 = require("./license-usage.service");
const license_usage_entity_1 = require("./entities/license-usage.entity");
let LicenseUsageInterceptor = class LicenseUsageInterceptor {
    constructor(licenseUsageService) {
        this.licenseUsageService = licenseUsageService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const user = request['user'];
        if (!user?.licenseId) {
            return next.handle();
        }
        const startTime = Date.now();
        const path = request.path;
        const method = request.method;
        return next.handle().pipe((0, operators_1.tap)(async () => {
            try {
                await this.licenseUsageService.trackUsage(user.licenseId, license_usage_entity_1.MetricType.API_CALLS, 1, {
                    path,
                    method,
                    duration: Date.now() - startTime,
                    timestamp: new Date(),
                });
                if (request.file || request.files) {
                    const totalSize = this.calculateUploadSize(request.file || request.files);
                    await this.licenseUsageService.trackUsage(user.licenseId, license_usage_entity_1.MetricType.STORAGE, totalSize, {
                        path,
                        method,
                        files: request.file || request.files,
                        timestamp: new Date(),
                    });
                }
            }
            catch (error) {
                console.error('Failed to track license usage:', error);
            }
        }));
    }
    calculateUploadSize(files) {
        if (!files)
            return 0;
        if (Array.isArray(files)) {
            return files.reduce((total, file) => total + file.size, 0);
        }
        return files.size || 0;
    }
};
exports.LicenseUsageInterceptor = LicenseUsageInterceptor;
exports.LicenseUsageInterceptor = LicenseUsageInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [license_usage_service_1.LicenseUsageService])
], LicenseUsageInterceptor);
//# sourceMappingURL=license-usage.interceptor.js.map