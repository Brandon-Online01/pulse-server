import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseGuard } from './base.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RoleGuard extends BaseGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        jwtService: JwtService,
    ) {
        super(jwtService);
    }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            'isPublic',
            [context.getHandler(), context.getClass()]
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const decodedToken = this.extractAndValidateToken(request);

        const { role } = decodedToken;

        if (!role) {
            throw new UnauthorizedException('access denied: no role found');
        }

        const requiredRoles = this.reflector.getAllAndOverride<AccessLevel[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // No specific roles required
        }

        // Convert role to uppercase to match enum
        const normalizedRole = role.toUpperCase();
        const hasRequiredRole = requiredRoles.some(requiredRole =>
            requiredRole.toLowerCase() === normalizedRole.toLowerCase()
        );

        if (!hasRequiredRole) {
            throw new UnauthorizedException('access denied: insufficient privileges');
        }

        return true;
    }
}