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
exports.UpdateClaimDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_claim_dto_1 = require("./create-claim.dto");
const finance_enums_1 = require("../../lib/enums/finance.enums");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateClaimDto extends (0, swagger_1.PartialType)(create_claim_dto_1.CreateClaimDto) {
    constructor() {
        super(...arguments);
        this.status = finance_enums_1.ClaimStatus.PENDING;
    }
}
exports.UpdateClaimDto = UpdateClaimDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_2.ApiProperty)({
        example: finance_enums_1.ClaimStatus.PENDING,
        description: 'Status of the claim'
    }),
    (0, class_validator_1.IsEnum)(finance_enums_1.ClaimStatus),
    __metadata("design:type", String)
], UpdateClaimDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: 'This is a description of the claim',
        description: 'Description of the claim'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClaimDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: 1000,
        description: 'Amount being claimed'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateClaimDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: 'https://example.com/document.pdf',
        description: 'URL reference to the uploaded document',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClaimDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: finance_enums_1.ClaimCategory.GENERAL,
        description: 'Category of the claim'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(finance_enums_1.ClaimCategory),
    __metadata("design:type", String)
], UpdateClaimDto.prototype, "category", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: 1,
        description: 'UID of the owner of the claim'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateClaimDto.prototype, "owner", void 0);
//# sourceMappingURL=update-claim.dto.js.map