import { AccessLevel, Status } from '../enums/enums';

export type Token = {
    username: string;
    sub: number;
    role: AccessLevel;
    status: Status;
    factoryReferenceID: string;
    iat: number;
    exp: number;
};