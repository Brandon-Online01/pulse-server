import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LicensingService } from '../licensing/licensing.service';
import { Request } from 'express';

@Injectable()
export class LicenseGuard implements CanActivate {
    constructor(private readonly licensingService: LicensingService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const organisationRef = request.headers['x-organisation-ref'] as string;

        if (!organisationRef) {
            throw new UnauthorizedException('Organization reference not provided');
        }

        const licenses = await this.licensingService.findByOrganisation(organisationRef);

        if (!licenses || licenses.length === 0) {
            throw new UnauthorizedException('No valid license found for organization');
        }

        // Get the most recent active license
        const activeLicense = licenses
            .sort((a, b) => b.validUntil.getTime() - a.validUntil.getTime())
            .find(license => this.licensingService.validateLicense(license.uid));

        if (!activeLicense) {
            throw new UnauthorizedException('No active license found for organization');
        }

        // Attach license to request for use in controllers
        request['license'] = activeLicense;
        return true;
    }
} 