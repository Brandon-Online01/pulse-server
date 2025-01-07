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
exports.FeatureGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_feature_decorator_1 = require("../decorators/require-feature.decorator");
const license_features_1 = require("../lib/constants/license-features");
let FeatureGuard = class FeatureGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredFeatures = this.reflector.getAllAndOverride(require_feature_decorator_1.FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredFeatures) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request['user'];
        if (!user?.licensePlan) {
            throw new common_1.ForbiddenException('No license information found');
        }
        const planFeatures = license_features_1.PLAN_FEATURES[user.licensePlan];
        if (!planFeatures) {
            throw new common_1.ForbiddenException('Invalid license plan');
        }
        const hasAccess = requiredFeatures.every(feature => planFeatures[feature] === true);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Your current plan does not include access to this feature');
        }
        return true;
    }
};
exports.FeatureGuard = FeatureGuard;
exports.FeatureGuard = FeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], FeatureGuard);
//# sourceMappingURL=feature.guard.js.map