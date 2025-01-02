import { AccessLevel } from '../lib/enums/user.enums';
export declare const ACCESS_KEY = "roles";
export declare const Roles: (...roles: AccessLevel[]) => import("@nestjs/common").CustomDecorator<string>;
