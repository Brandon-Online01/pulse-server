"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ACCESS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ACCESS_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ACCESS_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=role.decorator.js.map