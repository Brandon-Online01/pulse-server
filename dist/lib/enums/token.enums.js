"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStatus = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["ACCESS"] = "access";
    TokenType["REFRESH"] = "refresh";
})(TokenType || (exports.TokenType = TokenType = {}));
var TokenStatus;
(function (TokenStatus) {
    TokenStatus["ACTIVE"] = "active";
    TokenStatus["INACTIVE"] = "inactive";
    TokenStatus["EXPIRED"] = "expired";
    TokenStatus["REVOKED"] = "revoked";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
//# sourceMappingURL=token.enums.js.map