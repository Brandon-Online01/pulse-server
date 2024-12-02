import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_KEY } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<AccessLevel[]>(ACCESS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!requiredRoles) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const user = request.user;

            if (!user?.role) {
                throw new UnauthorizedException('access denied - no role information');
            }

            const hasRequiredRole = requiredRoles.some((role) => role === user.role);

            if (!hasRequiredRole) {
                throw new UnauthorizedException(
                    `access denied - user ${user.username || 'unknown'} with role ${user.role} is not authorized. required roles: ${requiredRoles.join(', ')}`
                );
            }

            return true;

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('role verification failed');
        }
    }
}