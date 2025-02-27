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
exports.UpdateBranchDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const create_branch_dto_1 = require("./create-branch.dto");
const status_enums_1 = require("../../lib/enums/status.enums");
const create_client_dto_1 = require("../../clients/dto/create-client.dto");
const class_transformer_1 = require("class-transformer");
class UpdateBranchDto extends (0, swagger_1.PartialType)(create_branch_dto_1.CreateBranchDto) {
}
exports.UpdateBranchDto = UpdateBranchDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The name of the branch',
        example: 'Branch 1',
    }),
    __metadata("design:type", String)
], UpdateBranchDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The email of the branch',
        example: 'branch@example.com',
    }),
    __metadata("design:type", String)
], UpdateBranchDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The phone number of the branch',
        example: '08033333333',
    }),
    __metadata("design:type", String)
], UpdateBranchDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The contact person of the branch',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], UpdateBranchDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_client_dto_1.AddressDto),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'The full address of the client including coordinates',
        type: create_client_dto_1.AddressDto,
    }),
    __metadata("design:type", create_client_dto_1.AddressDto)
], UpdateBranchDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The website of the branch',
        example: 'https://www.branch.com',
    }),
    __metadata("design:type", String)
], UpdateBranchDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(status_enums_1.GeneralStatus),
    (0, swagger_1.ApiProperty)({
        description: 'The status of the branch',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], UpdateBranchDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'The deleted status of the branch',
        example: false,
    }),
    __metadata("design:type", Boolean)
], UpdateBranchDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'The organisation of the branch',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], UpdateBranchDto.prototype, "organisation", void 0);
//# sourceMappingURL=update-branch.dto.js.map