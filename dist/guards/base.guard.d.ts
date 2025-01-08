import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Token } from '../lib/types/token';
export declare class BaseGuard {
    protected readonly jwtService: JwtService;
    constructor(jwtService: JwtService);
    protected extractAndValidateToken(request: Request): Token;
    private extractTokenFromHeader;
}
