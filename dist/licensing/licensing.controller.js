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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicensingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const licensing_service_1 = require("./licensing.service");
const create_license_dto_1 = require("./dto/create-license.dto");
const update_license_dto_1 = require("./dto/update-license.dto");
const license_entity_1 = require("./entities/license.entity");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
const license_rate_limit_guard_1 = require("./lib/guards/license-rate-limit.guard");
const license_exception_filter_1 = require("./lib/filters/license-exception.filter");
const user_enums_1 = require("../lib/enums/user.enums");
const role_decorator_1 = require("../decorators/role.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
let LicensingController = class LicensingController {
    constructor(licensingService) {
        this.licensingService = licensingService;
    }
    create(createLicenseDto) {
        return this.licensingService.create(createLicenseDto);
    }
    findAll() {
        return this.licensingService.findAll();
    }
    findOne(ref) {
        return this.licensingService.findOne(ref);
    }
    findByOrganisation(ref) {
        return this.licensingService.findByOrganisation(ref);
    }
    update(ref, updateLicenseDto) {
        return this.licensingService.update(ref, updateLicenseDto);
    }
    validate(ref) {
        return this.licensingService.validateLicense(ref);
    }
    renew(ref) {
        return this.licensingService.renewLicense(ref);
    }
    suspend(ref) {
        return this.licensingService.suspendLicense(ref);
    }
    activate(ref) {
        return this.licensingService.activateLicense(ref);
    }
};
exports.LicensingController = LicensingController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.isPublic)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new license' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'License created successfully', type: license_entity_1.License }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_license_dto_1.CreateLicenseDto]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all licenses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all licenses', type: [license_entity_1.License] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get license by reference' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the license', type: license_entity_1.License }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'License not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('organisation/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get licenses by organisation reference' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns organisation licenses', type: [license_entity_1.License] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Organisation not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "findByOrganisation", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({ summary: 'Update license' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'License updated successfully', type: license_entity_1.License }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'License not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_license_dto_1.UpdateLicenseDto]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':ref/validate'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Validate license' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns license validation status' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'License not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)(':ref/renew'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({ summary: 'Renew license' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'License renewed successfully', type: license_entity_1.License }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'License not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "renew", null);
__decorate([
    (0, common_1.Post)(':ref/suspend'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend license' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'License suspended successfully', type: license_entity_1.License }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'License not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':ref/activate'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({ summary: 'Activate license' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'License activated successfully', type: license_entity_1.License }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'License not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too Many Requests' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "activate", null);
exports.LicensingController = LicensingController = __decorate([
    (0, swagger_1.ApiTags)('licensing'),
    (0, common_1.Controller)('licensing'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard, license_rate_limit_guard_1.LicenseRateLimitGuard),
    (0, common_1.UseFilters)(license_exception_filter_1.LicenseExceptionFilter),
    __metadata("design:paramtypes", [licensing_service_1.LicensingService])
], LicensingController);
//# sourceMappingURL=licensing.controller.js.map