import * as redisStore from 'cache-manager-ioredis';
import { CacheModuleOptions } from '@nestjs/cache-manager';

export const redisConfig: CacheModuleOptions = {
    store: redisStore,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    ttl: parseInt(process.env.REDIS_TTL),
    max: 1000,
};