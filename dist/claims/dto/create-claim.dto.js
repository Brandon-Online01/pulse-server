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
exports.CreateClaimDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const status_enums_1 = require("../../lib/enums/status.enums");
const finance_enums_1 = require("../../lib/enums/finance.enums");
class CreateClaimDto {
}
exports.CreateClaimDto = CreateClaimDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'The amount of the claim',
        example: 1000,
    }),
    __metadata("design:type", Number)
], CreateClaimDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'The file url of the claim',
        example: 'https://example.com/file.pdf',
    }),
    __metadata("design:type", String)
], CreateClaimDto.prototype, "fileUrl", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'The user reference code of the person who verified the claim',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], CreateClaimDto.prototype, "verifiedBy", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'The boolean value to check if the claim is deleted',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CreateClaimDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(status_enums_1.ClaimStatus),
    (0, swagger_1.ApiProperty)({
        description: 'The status of the claim',
        example: status_enums_1.ClaimStatus.PENDING,
    }),
    __metadata("design:type", String)
], CreateClaimDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'The owner reference code of the claim',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], CreateClaimDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'The branch reference code of the claim',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], CreateClaimDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The comments of the claim',
        example: 'This is a comment',
    }),
    __metadata("design:type", String)
], CreateClaimDto.prototype, "comments", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(finance_enums_1.ClaimCategory),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The category of the claim',
        example: finance_enums_1.ClaimCategory.GENERAL,
    }),
    __metadata("design:type", String)
], CreateClaimDto.prototype, "category", void 0);
//# sourceMappingURL=create-claim.dto.js.map