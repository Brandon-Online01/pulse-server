import { Request } from 'express';
import { LicensingService } from '../licensing/licensing.service';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

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

			const user = request['user'];

			if (!user) {
				return false;
			}

			// Check for licenseId in the token first (preferred method)
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

			// Fallback to checking licenses array if licenseId not directly available
			const licenses = user.licenses || [];
			if (!licenses.length) {
				return false;
			}

			// Check all licenses and find the first valid one
			const validationResults = await Promise.all(
				licenses.map(async (license) => ({
					license,
					isValid: await this.licensingService.validateLicense(String(license.uid)),
				})),
			);

			const validLicense = validationResults.find((result) => result.isValid)?.license;

			if (validLicense) {
				// Attach valid license info to the request
				request['license'] = {
					id: validLicense.uid,
					plan: validLicense.plan,
				};

				// Cache the validation result for this request
				request['licenseValidated'] = true;

				return true;
			}

			return false;
		} catch (error) {
			return false;
		}
	}
}
