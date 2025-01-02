import { AccessLevel } from "../enums/user.enums";
import { TokenStatus } from "../enums/token.enums";
export type Token = {
    username: string;
    sub: number;
    role: AccessLevel;
    status: TokenStatus;
    factoryReferenceID: string;
    iat: number;
    exp: number;
};
