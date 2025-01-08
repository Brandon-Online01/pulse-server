import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Token } from '../lib/types/token';

@Injectable()
export class BaseGuard {
    constructor(protected readonly jwtService: JwtService) { }

    protected extractAndValidateToken(request: Request): Token {
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            // Check if token is already validated in this request
            if (request['decodedToken']) {
                return request['decodedToken'];
            }

            const decodedToken = this.jwtService.decode(token) as Token;

            if (!decodedToken) {
                throw new UnauthorizedException('Invalid token format');
            }

            // Cache the decoded token in the request object
            request['decodedToken'] = decodedToken;
            return decodedToken;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const token = request.headers['token'] as string;
        if (!token) {
            const [type, authToken] = request.headers.authorization?.split(' ') ?? [];
            return type === 'Bearer' ? authToken : undefined;
        }
        return token;
    }
} 