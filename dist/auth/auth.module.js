"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_1 = require("@nestjs/jwt");
const user_module_1 = require("../user/user.module");
const rewards_module_1 = require("../rewards/rewards.module");
const pending_signup_service_1 = require("./pending-signup.service");
const password_reset_service_1 = require("./password-reset.service");
const typeorm_1 = require("@nestjs/typeorm");
const pending_signup_entity_1 = require("./entities/pending-signup.entity");
const password_reset_entity_1 = require("./entities/password-reset.entity");
const licensing_module_1 = require("../licensing/licensing.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([pending_signup_entity_1.PendingSignup, password_reset_entity_1.PasswordReset]),
            jwt_1.JwtModule.register({
                global: true,
                secret: 'K9HXmP$2vL5nR8qY3wZ7jB4cF6hN9kM@pT2xS5vA8dG4jE7mQ9nU',
                signOptions: { expiresIn: '1h' },
            }),
            user_module_1.UserModule,
            rewards_module_1.RewardsModule,
            licensing_module_1.LicensingModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, pending_signup_service_1.PendingSignupService, password_reset_service_1.PasswordResetService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map