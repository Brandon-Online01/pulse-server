import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { LicensingService } from '../licensing/licensing.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private licensingService: LicensingService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            // Check license if user belongs to an organization
            if (payload.organisationRef && payload.licenseId) {
                const isLicenseValid = await this.licensingService.validateLicense(payload.licenseId);
                if (!isLicenseValid) {
                    throw new UnauthorizedException('Your organization\'s license has expired');
                }
            }

            // Attach user and license info to request
            request['user'] = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}