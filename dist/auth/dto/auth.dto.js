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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordInput = exports.ForgotPasswordInput = exports.SetPasswordInput = exports.VerifyEmailInput = exports.SignUpInput = exports.SignInInput = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SignInInput {
}
exports.SignInInput = SignInInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'brandon',
        description: 'The username of the user',
    }),
    __metadata("design:type", String)
], SignInInput.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'brandon@2024',
        description: 'The password of the user',
    }),
    __metadata("design:type", String)
], SignInInput.prototype, "password", void 0);
class SignUpInput {
}
exports.SignUpInput = SignUpInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        example: 'brandon@loro.co.za',
        description: 'The email of the user',
    }),
    __metadata("design:type", String)
], SignUpInput.prototype, "email", void 0);
class VerifyEmailInput {
}
exports.VerifyEmailInput = VerifyEmailInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'abc123',
        description: 'The verification token sent via email',
    }),
    __metadata("design:type", String)
], VerifyEmailInput.prototype, "token", void 0);
class SetPasswordInput {
}
exports.SetPasswordInput = SetPasswordInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'abc123',
        description: 'The verification token sent via email',
    }),
    __metadata("design:type", String)
], SetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, number/special character',
    }),
    (0, swagger_1.ApiProperty)({
        example: 'StrongPass123!',
        description: 'The new password for the account',
    }),
    __metadata("design:type", String)
], SetPasswordInput.prototype, "password", void 0);
class ForgotPasswordInput {
}
exports.ForgotPasswordInput = ForgotPasswordInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        example: 'brandon@loro.co.za',
        description: 'The email of the user',
    }),
    __metadata("design:type", String)
], ForgotPasswordInput.prototype, "email", void 0);
class ResetPasswordInput {
}
exports.ResetPasswordInput = ResetPasswordInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'abc123',
        description: 'The password reset token sent via email',
    }),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, number/special character',
    }),
    (0, swagger_1.ApiProperty)({
        example: 'StrongPass123!',
        description: 'The new password for the account',
    }),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "password", void 0);
//# sourceMappingURL=auth.dto.js.map