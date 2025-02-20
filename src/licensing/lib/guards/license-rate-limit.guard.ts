import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LicenseRateLimitGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string> {
        return Promise.resolve(req.ip);
    }

    protected getLimit(context: ExecutionContext): Promise<number> {
        const { route } = context.switchToHttp().getRequest();
        const customLimits = {
            '/licensing/validate': 100,
            '/licensing': 30,
            default: 50,
        };
        return Promise.resolve(customLimits[route?.path] || customLimits.default);
    }

    protected getTtl(context: ExecutionContext): Promise<number> {
        return Promise.resolve(60); // 60 seconds
    }
} 