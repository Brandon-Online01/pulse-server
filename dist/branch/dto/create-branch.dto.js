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
exports.CreateBranchDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const status_enums_1 = require("../../lib/enums/status.enums");
class CreateBranchDto {
}
exports.CreateBranchDto = CreateBranchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Branch Name',
        description: 'The name of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'brandon@loro.co.za',
        description: 'The email of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0712345678',
        description: 'The phone number of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com',
        description: 'The website of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Brandon N Nkawu',
        description: 'The contact person of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "contactPerson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1234567890',
        description: 'The reference code of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "ref", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123 Main Street, Anytown, USA',
        description: 'The address of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: status_enums_1.GeneralStatus.ACTIVE,
        description: 'The status of the branch'
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The reference code of the organisation'
    }),
    __metadata("design:type", Object)
], CreateBranchDto.prototype, "organisation", void 0);
//# sourceMappingURL=create-branch.dto.js.map