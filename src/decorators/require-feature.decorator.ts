import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'features';
export const RequireFeature = (...features: string[]) => SetMetadata(FEATURE_KEY, features); 