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
exports.CreateCheckOutDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCheckOutDto {
}
exports.CreateCheckOutDto = CreateCheckOutDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The photo of the check-out',
        example: `${new Date()}`
    }),
    __metadata("design:type", String)
], CreateCheckOutDto.prototype, "checkOutTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The location of the check-out',
        example: '-36.3434314, 149.8488864'
    }),
    __metadata("design:type", String)
], CreateCheckOutDto.prototype, "checkOutLocation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The saved check out photo tag name i.e check-out.jpg',
        example: 'check-out.jpg'
    }),
    __metadata("design:type", String)
], CreateCheckOutDto.prototype, "checkOutPhoto", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'The reference of the check-in',
        example: {
            uid: 1
        }
    }),
    __metadata("design:type", Object)
], CreateCheckOutDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: {
            uid: 1
        },
        description: 'The branch reference code of the attendance check in'
    }),
    __metadata("design:type", Object)
], CreateCheckOutDto.prototype, "branch", void 0);
//# sourceMappingURL=create-check-out.dto.js.map