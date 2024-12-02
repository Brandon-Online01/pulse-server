import { SetMetadata } from '@nestjs/common';
import { AccessLevel } from '../lib/enums/enums';

export const ACCESS_KEY = 'roles';
export const Roles = (...roles: AccessLevel[]) => SetMetadata(ACCESS_KEY, roles);