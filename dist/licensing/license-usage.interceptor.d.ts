import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LicenseUsageService } from './license-usage.service';
import { LicensingService } from './licensing.service';
export declare class LicenseUsageInterceptor implements NestInterceptor {
    private readonly licenseUsageService;
    private readonly licensingService;
    private readonly logger;
    constructor(licenseUsageService: LicenseUsageService, licensingService: LicensingService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private calculateUploadSize;
}
