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
exports.UpdateResellerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_reseller_dto_1 = require("./create-reseller.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_client_dto_1 = require("../../clients/dto/create-client.dto");
class UpdateResellerDto extends (0, swagger_1.PartialType)(create_reseller_dto_1.CreateResellerDto) {
}
exports.UpdateResellerDto = UpdateResellerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The name of the reseller',
        example: 'ABC Company',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The description of the reseller',
        example: 'ABC Company is a reseller of products',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The logo of the reseller',
        example: 'https://example.com/logo.png',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The website of the reseller',
        example: 'https://example.com',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The contact person of the reseller',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The phone of the reseller',
        example: '1234567890',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The email of the reseller',
        example: 'john.doe@example.com',
    }),
    __metadata("design:type", String)
], UpdateResellerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_client_dto_1.AddressDto),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The full address of the client including coordinates',
        type: create_client_dto_1.AddressDto,
    }),
    __metadata("design:type", create_client_dto_1.AddressDto)
], UpdateResellerDto.prototype, "address", void 0);
//# sourceMappingURL=update-reseller.dto.js.map