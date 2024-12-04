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
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            'isPublic',
            [context.getHandler(), context.getClass()]
        );

        if (isPublic) {
            return true;
        }

        try {
            const requiredRoles = this.reflector.getAllAndOverride<AccessLevel[]>(ACCESS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            console.log(requiredRoles);

            if (!requiredRoles) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const user = request.user;

            console.log(user);

            if (!user?.role) {
                throw new UnauthorizedException('access denied');
            }

            const hasRequiredRole = requiredRoles.some((role) => role === user?.role);

            if (!hasRequiredRole) {
                throw new UnauthorizedException(`access denied`);
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