import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LicensingService } from '../licensing/licensing.service';
import { BaseGuard } from './base.guard';
export declare class AuthGuard extends BaseGuard implements CanActivate {
    private readonly licensingService;
    constructor(jwtService: JwtService, licensingService: LicensingService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
