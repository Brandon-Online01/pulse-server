import { Request } from 'express';
import { LicensingService } from '../licensing/licensing.service';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Token } from '../lib/types/token';

@Injectable()
export class LicenseGuard implements CanActivate {
	constructor(private readonly licensingService: LicensingService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const request = context.switchToHttp().getRequest<Request>();

			// If license validation was already performed by the AuthGuard and cached in the request
			if (request['licenseValidated'] === true) {
				// If we already validated the license in this request, use that result
				return true;
			}

			const user = request['user'] as Token;

			if (!user) {
				return false;
			}

			// Check for licenseId in the token
			if (user.licenseId) {
				const isValid = await this.licensingService.validateLicense(user.licenseId);

				// If valid, attach license info to the request
				if (isValid && user.licensePlan) {
					request['license'] = {
						id: user.licenseId,
						plan: user.licensePlan,
					};

					// Cache the validation result for this request
					request['licenseValidated'] = true;
				}

				return isValid;
			}

			// No valid license found
			return false;
		} catch (error) {
			return false;
		}
	}
}
