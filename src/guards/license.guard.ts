import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { LicensingService } from '../licensing/licensing.service';
import { Request } from 'express';

@Injectable()
export class LicenseGuard implements CanActivate {
    constructor(private readonly licensingService: LicensingService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request['user'];

        if (!user) {
            return false;
        }

        const licenses = user.licenses || [];
        if (!licenses.length) {
            return false;
        }

        // Find any valid license
        const validLicense = await licenses
            .find(async (license) => await this.licensingService.validateLicense(String(license.uid)));

        return !!validLicense;
    }
} 