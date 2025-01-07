import { CanActivate, ExecutionContext } from '@nestjs/common';
import { LicensingService } from '../licensing/licensing.service';
export declare class LicenseGuard implements CanActivate {
    private readonly licensingService;
    constructor(licensingService: LicensingService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
