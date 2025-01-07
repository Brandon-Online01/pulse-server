"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireFeature = exports.FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.FEATURE_KEY = 'features';
const RequireFeature = (...features) => (0, common_1.SetMetadata)(exports.FEATURE_KEY, features);
exports.RequireFeature = RequireFeature;
//# sourceMappingURL=require-feature.decorator.js.map