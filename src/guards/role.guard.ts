import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../lib/types/token';
import { AccessLevel } from '../lib/enums/user.enums'

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            'isPublic',
            [context.getHandler(), context.getClass()]
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('you are not authorized to access this resource');
        }

        try {
            const decodedToken = this.jwtService.decode(token) as Token;

            if (!decodedToken) {
                throw new UnauthorizedException('invalid token format');
            }

            const { role } = decodedToken;

            if (!role) {
                throw new UnauthorizedException('access denied');
            }

            const requiredRoles = this.reflector.getAllAndOverride<AccessLevel[]>('roles', [
                context.getHandler(),
                context.getClass(),
            ]);

            const hasRequiredRole = requiredRoles.includes(role);

            if (!hasRequiredRole) {
                throw new UnauthorizedException('access denied');
            }

            return true;
        } catch (error) {
            throw new UnauthorizedException('you are not authorized to access this resource');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        return request.headers['token'] as string;
    }
}