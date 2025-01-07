import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LicenseUsageService } from './license-usage.service';
export declare class LicenseUsageInterceptor implements NestInterceptor {
    private readonly licenseUsageService;
    constructor(licenseUsageService: LicenseUsageService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private calculateUploadSize;
}
