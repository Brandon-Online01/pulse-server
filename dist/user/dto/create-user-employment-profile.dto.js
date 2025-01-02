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
exports.CreateUserEmploymentProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_enums_1 = require("../../lib/enums/user.enums");
class CreateUserEmploymentProfileDto {
}
exports.CreateUserEmploymentProfileDto = CreateUserEmploymentProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'Branch reference code',
        example: { uid: 1 },
        required: false
    }),
    __metadata("design:type", Object)
], CreateUserEmploymentProfileDto.prototype, "branchref", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'User reference code',
        example: { uid: 1 },
        required: false
    }),
    __metadata("design:type", Object)
], CreateUserEmploymentProfileDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Position in the company',
        example: 'Senior Software Engineer',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserEmploymentProfileDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_enums_1.Department),
    (0, swagger_1.ApiProperty)({
        description: 'Department',
        example: user_enums_1.Department.ENGINEERING,
        required: false
    }),
    __metadata("design:type", String)
], CreateUserEmploymentProfileDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        description: 'Employment start date',
        example: `${new Date()}`,
        required: false
    }),
    __metadata("design:type", Date)
], CreateUserEmploymentProfileDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        description: 'Employment end date',
        example: `${new Date()}`,
        required: false
    }),
    __metadata("design:type", Date)
], CreateUserEmploymentProfileDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'Whether currently employed',
        example: true,
        default: true
    }),
    __metadata("design:type", Boolean)
], CreateUserEmploymentProfileDto.prototype, "isCurrentlyEmployed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        description: 'Work email address',
        example: 'brandon.work@loro.co.za',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserEmploymentProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Work contact number',
        example: '+27 64 123 4567',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserEmploymentProfileDto.prototype, "contactNumber", void 0);
//# sourceMappingURL=create-user-employment-profile.dto.js.map