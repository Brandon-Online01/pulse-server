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
exports.UpdateClientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const create_client_dto_1 = require("./create-client.dto");
const class_transformer_1 = require("class-transformer");
class UpdateClientDto extends (0, swagger_1.PartialType)(create_client_dto_1.CreateClientDto) {
}
exports.UpdateClientDto = UpdateClientDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'ACME Inc.',
        description: 'The name of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'John Doe',
        description: 'The contact person of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'john.doe@loro.co.za',
        description: 'The email of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: '+27 64 123 4567',
        description: 'The phone number of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: '+27 64 123 4567',
        description: 'The alternative phone number of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "alternativePhone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://www.loro.co.za',
        description: 'The website of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://www.loro.co.za/logo.png',
        description: 'The logo of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'This is a description of the client',
        description: 'The description of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_client_dto_1.AddressDto),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The full address of the client including coordinates',
        type: create_client_dto_1.AddressDto,
    }),
    __metadata("design:type", create_client_dto_1.AddressDto)
], UpdateClientDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether the client is deleted',
    }),
    __metadata("design:type", Boolean)
], UpdateClientDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: '1234567890',
        description: 'The reference code of the client',
    }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "ref", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The assigned sales rep of the client',
    }),
    __metadata("design:type", Object)
], UpdateClientDto.prototype, "assignedSalesRep", void 0);
//# sourceMappingURL=update-client.dto.js.map