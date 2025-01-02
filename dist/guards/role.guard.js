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
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
let RoleGuard = class RoleGuard {
    constructor(reflector, jwtService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [context.getHandler(), context.getClass()]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('you are not authorized to access this resource');
        }
        try {
            const decodedToken = this.jwtService.decode(token);
            if (!decodedToken) {
                throw new common_1.UnauthorizedException('invalid token format');
            }
            const { role } = decodedToken;
            if (!role) {
                throw new common_1.UnauthorizedException('access denied');
            }
            const requiredRoles = this.reflector.getAllAndOverride('roles', [
                context.getHandler(),
                context.getClass(),
            ]);
            const hasRequiredRole = requiredRoles.includes(role);
            if (!hasRequiredRole) {
                throw new common_1.UnauthorizedException('access denied');
            }
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('you are not authorized to access this resource');
        }
    }
    extractTokenFromHeader(request) {
        return request.headers['token'];
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService])
], RoleGuard);
//# sourceMappingURL=role.guard.js.map