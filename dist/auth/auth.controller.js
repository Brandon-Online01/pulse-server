"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../decorators/public.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    signUp(signUpInput) {
        return this.authService.signUp(signUpInput);
    }
    verifyEmail(verifyEmailInput) {
        return this.authService.verifyEmail(verifyEmailInput);
    }
    setPassword(setPasswordInput) {
        return this.authService.setPassword(setPasswordInput);
    }
    forgotPassword(forgotPasswordInput) {
        return this.authService.forgotPassword(forgotPasswordInput);
    }
    resetPassword(resetPasswordInput) {
        return this.authService.resetPassword(resetPasswordInput);
    }
    signIn(signInInput) {
        return this.authService.signIn(signInInput);
    }
    async refreshToken(refreshToken) {
        return this.authService.refreshToken(refreshToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('sign-up'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Sign up',
        description: 'Initiates the sign-up process for a new user'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.SignUpInput }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Sign-up initiated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Verification email sent' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid email format' }
            }
        }
    }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Conflict - Email already in use',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Email already in use' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignUpInput]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify email',
        description: 'Verifies a user email using the token received via email'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.VerifyEmailInput }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Email verified successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Email verified' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid token',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid or expired token' }
            }
        }
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyEmailInput]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('set-password'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Set password',
        description: 'Sets the user password after email verification'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.SetPasswordInput }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Password set successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password set successfully' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid token or password',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid token or password requirements not met' }
            }
        }
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SetPasswordInput]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setPassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Forgot password',
        description: 'Requests a password reset email'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ForgotPasswordInput }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Password reset email sent',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password reset email sent' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid email',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Email not found' }
            }
        }
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordInput]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password',
        description: 'Resets the user password using a token received via email'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ResetPasswordInput }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Password reset successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password reset successfully' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid token or password',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid token or password requirements not met' }
            }
        }
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordInput]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('sign-in'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Sign in',
        description: 'Authenticates a user using email and password'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.SignInInput }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Authentication successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid credentials',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid credentials' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignInInput]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, public_decorator_1.isPublic)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh token',
        description: 'Generates a new access token using a valid refresh token'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                refreshToken: { type: 'string' }
            },
            required: ['refreshToken']
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Token refreshed successfully',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid refresh token',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid refresh token' }
            }
        }
    }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map