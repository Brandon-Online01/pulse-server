import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_KEY } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';
import { Token } from '../lib/types/token';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        const requiredRoles = this.reflector.getAllAndOverride<AccessLevel[]>(ACCESS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        if (!token) {
            throw new UnauthorizedException('You are not authorized to access this resource');
        }

        const decodedToken: Token = this.jwtService.decode(token) as Token;

        const { role: requestedOriginRole } = decodedToken;

        const { user } = context.switchToHttp().getRequest();

        if (!requestedOriginRole) {
            throw new UnauthorizedException('You are not authorized to access this resource');
        }

        const hasRole = requiredRoles?.some((role) => role === requestedOriginRole);

        if (!hasRole) {
            throw new UnauthorizedException(
                `User ${user?.username} with role ${requestedOriginRole} is not authorized to access this resource. Required roles: ${requiredRoles?.join(', ')}`,
            );
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        return request.headers['token'] as string;
    }
}