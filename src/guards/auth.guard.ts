import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Status } from '../lib/enums/enums';
import { Token } from '../lib/types/token';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

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

            const { status, exp } = decodedToken;

            if (status !== Status.ACTIVE || this.isTokenExpired(exp)) {
                throw new UnauthorizedException(
                    status !== Status.ACTIVE
                        ? 'your account is not active'
                        : 'your session has expired'
                );
            }

            request['user'] = decodedToken;
            return true;
        } catch (error) {
            throw new UnauthorizedException('you are not authorized to access this resource');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        return request.headers['token'] as string;
    }

    private isTokenExpired(expirationTime: number): boolean {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        return currentTimeInSeconds > expirationTime;
    }
}