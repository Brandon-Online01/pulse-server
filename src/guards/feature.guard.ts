import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/require-feature.decorator';
import { License } from '../licensing/entities/license.entity';

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
        const license: License = request['license'];

        if (!license || !license.features) {
            throw new ForbiddenException('No license features found');
        }

        const hasAccess = requiredFeatures.every(feature => license.features[feature] === true);

        if (!hasAccess) {
            throw new ForbiddenException('License does not include required features');
        }

        return true;
    }
} 