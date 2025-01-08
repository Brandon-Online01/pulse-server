import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LicenseUsageService } from './license-usage.service';
import { MetricType } from './entities/license-usage.entity';
import { LicensingService } from './licensing.service';
import { Request } from 'express';

@Injectable()
export class LicenseUsageInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LicenseUsageInterceptor.name);

    constructor(
        private readonly licenseUsageService: LicenseUsageService,
        private readonly licensingService: LicensingService
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request['user'];

        // Skip if no user or no license info
        if (!user?.licenseId) {
            return next.handle();
        }

        const startTime = Date.now();
        const path = request.path;
        const method = request.method;

        try {
            // Get the actual license object
            const license = await this.licensingService.findOne(user.licenseId);
            if (!license) {
                this.logger.warn(`No valid license found for user ${user.uid}`);
                return next.handle();
            }

            return next.handle().pipe(
                tap(async () => {
                    try {
                        // Track API call usage
                        await this.licenseUsageService.trackUsage(
                            license,
                            MetricType.API_CALLS,
                            1,
                            {
                                path,
                                method,
                                duration: Date.now() - startTime,
                                timestamp: new Date().toISOString(),
                                userId: user.uid
                            }
                        );

                        // Track storage usage for file uploads
                        if (request.file || request.files) {
                            const totalSize = this.calculateUploadSize(request.file || request.files);
                            if (totalSize > 0) {
                                await this.licenseUsageService.trackUsage(
                                    license,
                                    MetricType.STORAGE,
                                    totalSize,
                                    {
                                        path,
                                        method,
                                        fileCount: Array.isArray(request.files) ? request.files.length : 1,
                                        timestamp: new Date().toISOString(),
                                        userId: user.uid
                                    }
                                );
                            }
                        }
                    } catch (error) {
                        this.logger.error(`Failed to track license usage: ${error.message}`, error.stack);
                    }
                })
            );
        } catch (error) {
            this.logger.error(`Error in license interceptor: ${error.message}`, error.stack);
            return next.handle();
        }
    }

    private calculateUploadSize(files: any): number {
        if (!files) return 0;

        try {
            if (Array.isArray(files)) {
                return files.reduce((total, file) => {
                    return total + (file?.size || 0);
                }, 0);
            }
            return files?.size || 0;
        } catch (error) {
            this.logger.error(`Error calculating upload size: ${error.message}`);
            return 0;
        }
    }
} 