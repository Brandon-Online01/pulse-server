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
exports.LicenseGuard = void 0;
const common_1 = require("@nestjs/common");
const licensing_service_1 = require("../licensing/licensing.service");
let LicenseGuard = class LicenseGuard {
    constructor(licensingService) {
        this.licensingService = licensingService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const organisationRef = request.headers['x-organisation-ref'];
        if (!organisationRef) {
            throw new common_1.UnauthorizedException('Organization reference not provided');
        }
        const licenses = await this.licensingService.findByOrganisation(organisationRef);
        if (!licenses || licenses.length === 0) {
            throw new common_1.UnauthorizedException('No valid license found for organization');
        }
        const activeLicense = licenses
            .sort((a, b) => b.validUntil.getTime() - a.validUntil.getTime())
            .find(license => this.licensingService.validateLicense(license.uid));
        if (!activeLicense) {
            throw new common_1.UnauthorizedException('No active license found for organization');
        }
        request['license'] = activeLicense;
        return true;
    }
};
exports.LicenseGuard = LicenseGuard;
exports.LicenseGuard = LicenseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [licensing_service_1.LicensingService])
], LicenseGuard);
//# sourceMappingURL=license.guard.js.map