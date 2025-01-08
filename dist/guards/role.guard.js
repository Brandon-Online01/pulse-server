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
exports.RoleGuard = void 0;
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const base_guard_1 = require("./base.guard");
const common_1 = require("@nestjs/common");
let RoleGuard = class RoleGuard extends base_guard_1.BaseGuard {
    constructor(reflector, jwtService) {
        super(jwtService);
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [context.getHandler(), context.getClass()]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const decodedToken = this.extractAndValidateToken(request);
        const { role } = decodedToken;
        if (!role) {
            throw new common_1.UnauthorizedException('access denied: no role found');
        }
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const normalizedRole = role.toUpperCase();
        const hasRequiredRole = requiredRoles.some(requiredRole => requiredRole.toLowerCase() === normalizedRole.toLowerCase());
        if (!hasRequiredRole) {
            console.log('Role check failed:', {
                providedRole: normalizedRole,
                requiredRoles: requiredRoles,
            });
            throw new common_1.UnauthorizedException('access denied: insufficient privileges');
        }
        return true;
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService])
], RoleGuard);
//# sourceMappingURL=role.guard.js.map