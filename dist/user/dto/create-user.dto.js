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
exports.CreateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_enums_1 = require("../../lib/enums/user.enums");
const status_enums_1 = require("../../lib/enums/status.enums");
const create_user_profile_dto_1 = require("./create-user-profile.dto");
const create_user_employment_profile_dto_1 = require("./create-user-employment-profile.dto");
const class_validator_1 = require("class-validator");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The username for authentication',
        example: 'brandon123',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The password for authentication',
        example: 'securePassword123',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The name of the user',
        example: 'Brandon',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The surname of the user',
        example: 'Nkawu',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "surname", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        description: 'The email of the user',
        example: 'brandon@Loro.co.za',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The phone number of the user',
        example: '+27 64 123 4567',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The photo URL of the user',
        example: 'https://example.com/photo.jpg',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "photoURL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_enums_1.AccessLevel),
    (0, swagger_1.ApiProperty)({
        description: 'The access level of the user',
        enum: user_enums_1.AccessLevel,
        example: user_enums_1.AccessLevel.USER,
        default: user_enums_1.AccessLevel.USER,
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "accessLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(status_enums_1.AccountStatus),
    (0, swagger_1.ApiProperty)({
        description: 'The status of the user',
        enum: status_enums_1.AccountStatus,
        example: status_enums_1.AccountStatus.ACTIVE,
        default: status_enums_1.AccountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The unique reference code for the user',
        example: 'USR123456',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "userref", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'Whether the user is deleted',
        example: false,
        default: false,
    }),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'User profile information',
        type: () => create_user_profile_dto_1.CreateUserProfileDto
    }),
    __metadata("design:type", create_user_profile_dto_1.CreateUserProfileDto)
], CreateUserDto.prototype, "profile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'User employment profile information',
        type: () => create_user_employment_profile_dto_1.CreateUserEmploymentProfileDto
    }),
    __metadata("design:type", create_user_employment_profile_dto_1.CreateUserEmploymentProfileDto)
], CreateUserDto.prototype, "employmentProfile", void 0);
//# sourceMappingURL=create-user.dto.js.map