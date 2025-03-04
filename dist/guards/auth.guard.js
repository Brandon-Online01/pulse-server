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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const licensing_service_1 = require("../licensing/licensing.service");
const base_guard_1 = require("./base.guard");
let AuthGuard = class AuthGuard extends base_guard_1.BaseGuard {
    constructor(jwtService, licensingService) {
        super(jwtService);
        this.licensingService = licensingService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const decodedToken = this.extractAndValidateToken(request);
        if (decodedToken.organisationRef && decodedToken.licenseId) {
            if (!request['licenseValidated']) {
                const isLicenseValid = await this.licensingService.validateLicense(decodedToken.licenseId);
                if (!isLicenseValid) {
                    throw new common_1.UnauthorizedException("Your organization's license has expired");
                }
                request['licenseValidated'] = true;
                if (!request['organization']) {
                    request['organization'] = {
                        ref: decodedToken.organisationRef,
                    };
                }
            }
        }
        if (decodedToken.branch && !request['branch']) {
            request['branch'] = decodedToken.branch;
        }
        if (!request['user']) {
            request['user'] = decodedToken;
        }
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, licensing_service_1.LicensingService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map