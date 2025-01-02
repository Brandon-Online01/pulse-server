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
exports.CreateCheckInDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCheckInDto {
}
exports.CreateCheckInDto = CreateCheckInDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The photo of the check-in',
        example: `${new Date()}`
    }),
    __metadata("design:type", String)
], CreateCheckInDto.prototype, "checkInTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The saved check in photo tag name i.e check-in.jpg',
        example: 'check-in.jpg'
    }),
    __metadata("design:type", String)
], CreateCheckInDto.prototype, "checkInPhoto", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The location of the check-in',
        example: '-36.3434314, 149.8488864'
    }),
    __metadata("design:type", String)
], CreateCheckInDto.prototype, "checkInLocation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        example: {
            uid: 1
        },
        description: 'The reference of the user',
    }),
    __metadata("design:type", Object)
], CreateCheckInDto.prototype, "owner", void 0);
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
], CreateCheckInDto.prototype, "branch", void 0);
//# sourceMappingURL=create-check-in.dto.js.map