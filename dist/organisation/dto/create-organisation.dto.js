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
exports.CreateOrganisationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_client_dto_1 = require("../../clients/dto/create-client.dto");
class CreateOrganisationDto {
}
exports.CreateOrganisationDto = CreateOrganisationDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Acme Inc.',
        description: 'The name of the organisation',
    }),
    __metadata("design:type", String)
], CreateOrganisationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_client_dto_1.AddressDto),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'The full address of the client including coordinates',
        type: create_client_dto_1.AddressDto,
    }),
    __metadata("design:type", create_client_dto_1.AddressDto)
], CreateOrganisationDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        example: 'brandon@loro.co.za',
        description: 'The email of the organisation',
    }),
    __metadata("design:type", String)
], CreateOrganisationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '123-456-7890',
        description: 'The phone number of the organisation',
    }),
    __metadata("design:type", String)
], CreateOrganisationDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Brandon Nkawu',
        description: 'The contact person of the organisation',
    }),
    __metadata("design:type", String)
], CreateOrganisationDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://www.acme.com',
        description: 'The website of the organisation',
    }),
    __metadata("design:type", String)
], CreateOrganisationDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://www.acme.com/logo.png',
        description: 'The logo of the organisation',
    }),
    __metadata("design:type", String)
], CreateOrganisationDto.prototype, "logo", void 0);
//# sourceMappingURL=create-organisation.dto.js.map