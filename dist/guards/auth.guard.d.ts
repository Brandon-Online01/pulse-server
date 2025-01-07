import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LicensingService } from '../licensing/licensing.service';
export declare class AuthGuard implements CanActivate {
    private jwtService;
    private licensingService;
    constructor(jwtService: JwtService, licensingService: LicensingService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
