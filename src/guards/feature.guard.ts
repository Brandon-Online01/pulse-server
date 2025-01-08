import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/require-feature.decorator';
import { PLAN_FEATURES } from '../lib/constants/license-features';

@Injectable()
export class FeatureGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredFeatures = this.reflector.getAllAndOverride<string[]>(FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredFeatures) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request['user'];

        // Check if user has license info
        if (!user?.licensePlan) {
            throw new ForbiddenException('No license information found');
        }

        // Get features available for the user's plan
        const planFeatures = PLAN_FEATURES[user.licensePlan];
        if (!planFeatures) {
            throw new ForbiddenException('Invalid license plan');
        }

        // Check if user has all required features
        const hasAccess = requiredFeatures?.every(feature => planFeatures[feature] === true);

        if (!hasAccess) {
            throw new ForbiddenException('Your current plan does not include access to this feature');
        }

        return true;
    }
} 