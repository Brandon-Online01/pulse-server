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
exports.CreateAssetDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAssetDto {
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Dell',
        description: 'The brand of the asset'
    }),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '1234567890',
        description: 'The serial number of the asset'
    }),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '1234567890',
        description: 'The model number of the asset'
    }),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "modelNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        example: `${new Date()}`,
        description: 'The purchase date of the asset'
    }),
    __metadata("design:type", Date)
], CreateAssetDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the asset has insurance'
    }),
    __metadata("design:type", Boolean)
], CreateAssetDto.prototype, "hasInsurance", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'ABC Insurance',
        description: 'The insurance provider of the asset'
    }),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "insuranceProvider", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        example: `${new Date()}`,
        description: 'The insurance expiry date of the asset'
    }),
    __metadata("design:type", Date)
], CreateAssetDto.prototype, "insuranceExpiryDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The reference code of the owner of the asset'
    }),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the asset'
    }),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "branch", void 0);
//# sourceMappingURL=create-asset.dto.js.map