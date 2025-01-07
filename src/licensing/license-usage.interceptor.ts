import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LicenseUsageService } from './license-usage.service';
import { MetricType } from './entities/license-usage.entity';
import { Request } from 'express';

@Injectable()
export class LicenseUsageInterceptor implements NestInterceptor {
    constructor(private readonly licenseUsageService: LicenseUsageService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request['user'];

        // Skip if no user or no license info
        if (!user?.licenseId) {
            return next.handle();
        }

        const startTime = Date.now();
        const path = request.path;
        const method = request.method;

        return next.handle().pipe(
            tap(async () => {
                try {
                    // Track API call usage
                    await this.licenseUsageService.trackUsage(
                        user.licenseId,
                        MetricType.API_CALLS,
                        1,
                        {
                            path,
                            method,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                        }
                    );

                    // Track storage usage for file uploads
                    if (request.file || request.files) {
                        const totalSize = this.calculateUploadSize(request.file || request.files);
                        await this.licenseUsageService.trackUsage(
                            user.licenseId,
                            MetricType.STORAGE,
                            totalSize,
                            {
                                path,
                                method,
                                files: request.file || request.files,
                                timestamp: new Date(),
                            }
                        );
                    }
                } catch (error) {
                    // Log error but don't block the request
                    console.error('Failed to track license usage:', error);
                }
            })
        );
    }

    private calculateUploadSize(files: any): number {
        if (!files) return 0;
        if (Array.isArray(files)) {
            return files.reduce((total, file) => total + file.size, 0);
        }
        return files.size || 0;
    }
} 