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
exports.CreateUserProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const gender_enums_1 = require("../../lib/enums/gender.enums");
const class_validator_1 = require("class-validator");
class CreateUserProfileDto {
}
exports.CreateUserProfileDto = CreateUserProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'User reference code',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], CreateUserProfileDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Height',
        example: '180cm',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Weight',
        example: '75kg',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Hair color',
        example: 'Brown',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "hairColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Eye color',
        example: 'Blue',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "eyeColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gender_enums_1.Gender),
    (0, swagger_1.ApiProperty)({
        description: 'Gender',
        enum: gender_enums_1.Gender,
        example: gender_enums_1.Gender.MALE,
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth',
        example: `${new Date()}`,
        required: false
    }),
    __metadata("design:type", Date)
], CreateUserProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Address',
        example: '123 Main Street',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'City',
        example: 'Cape Town',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Country',
        example: 'South Africa',
        required: false
    }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "country", void 0);
//# sourceMappingURL=create-user-profile.dto.js.map