import { Injectable } from '@nestjs/common';
import { PlatformType } from '../enums/platform.enums';

@Injectable()
export class PlatformService {
	/**
	 * Determine available platforms based on license features
	 * @param features License features object
	 * @returns Array of available platform types
	 */
	getAvailablePlatforms(features: Record<string, boolean>): PlatformType[] {
		if (!features) {
			return [];
		}

		const platforms: PlatformType[] = [];

		if (features['platform.hr']) {
			platforms.push(PlatformType.HR);
		}
		if (features['platform.sales']) {
			platforms.push(PlatformType.SALES);
		}
		if (features['platform.crm']) {
			platforms.push(PlatformType.CRM);
		}

		// If all platforms are available, return ALL
		if (platforms.length === 3) {
			return [PlatformType.ALL];
		}

		return platforms;
	}

	/**
	 * Get the primary platform type based on license features
	 * Returns 'all' if multiple platforms are available, otherwise the single platform
	 * @param features License features object
	 * @returns Platform type string
	 */
	getPrimaryPlatform(features: Record<string, boolean>): string {
		const availablePlatforms = this.getAvailablePlatforms(features);

		if (availablePlatforms.length === 0) {
			return 'crm'; // Default fallback
		}

		if (availablePlatforms.includes(PlatformType.ALL)) {
			return 'all';
		}

		if (availablePlatforms.length === 1) {
			return availablePlatforms[0];
		}

		// Multiple platforms but not all - return 'all' for backward compatibility
		return 'all';
	}

	/**
	 * Check if a specific platform is available based on license features
	 * @param features License features object
	 * @param platform Platform to check
	 * @returns True if platform is available
	 */
	hasPlatformAccess(features: Record<string, boolean>, platform: PlatformType): boolean {
		if (!features) {
			return false;
		}

		// Check for specific platform access
		switch (platform) {
			case PlatformType.HR:
				return features['platform.hr'] === true;
			case PlatformType.SALES:
				return features['platform.sales'] === true;
			case PlatformType.CRM:
				return features['platform.crm'] === true;
			case PlatformType.ALL:
				return (
					features['platform.hr'] === true &&
					features['platform.sales'] === true &&
					features['platform.crm'] === true
				);
			default:
				return false;
		}
	}
}
