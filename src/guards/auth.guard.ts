import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators';
import { Status } from '../lib/enums/enums';
import { Token } from '../lib/types/token';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        if (!token) {
            throw new UnauthorizedException('You are not authorized to access this resource');
        }

        const decodedToken: Token = this.jwtService.decode(token) as Token;

        if (!decodedToken) {
            throw new UnauthorizedException('Your session has expired test');
        }

        const { status, exp } = decodedToken;

        if (status !== Status.ACTIVE) {
            throw new UnauthorizedException('Your account is not active');
        }

        if (this.isTokenExpired(exp)) {
            throw new UnauthorizedException('Your session has expired');
        }

        try {
            const payload = await this.jwtService.decode(token);
            request['user'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException('You are not authorized to access this resource');
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