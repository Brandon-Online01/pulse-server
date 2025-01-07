"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseOnly = EnterpriseOnly;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../guards/auth.guard");
const feature_guard_1 = require("../guards/feature.guard");
const require_feature_decorator_1 = require("./require-feature.decorator");
function EnterpriseOnly(module) {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(auth_guard_1.AuthGuard, feature_guard_1.FeatureGuard), (0, require_feature_decorator_1.RequireFeature)(`${module}.access`));
}
//# sourceMappingURL=enterprise-only.decorator.js.map