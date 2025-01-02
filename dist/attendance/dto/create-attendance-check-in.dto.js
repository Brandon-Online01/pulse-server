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
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const attendance_enums_1 = require("../../lib/enums/attendance.enums");
class CreateCheckInDto {
}
exports.CreateCheckInDto = CreateCheckInDto;
__decorate([
    (0, class_validator_1.IsEnum)(attendance_enums_1.AttendanceStatus),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        enum: attendance_enums_1.AttendanceStatus,
        required: false,
        example: attendance_enums_1.AttendanceStatus.PRESENT,
        default: attendance_enums_1.AttendanceStatus.PRESENT
    }),
    __metadata("design:type", String)
], CreateCheckInDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        type: Date,
        required: true,
        example: `${new Date()}`
    }),
    __metadata("design:type", Date)
], CreateCheckInDto.prototype, "checkIn", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: 40.7128
    }),
    __metadata("design:type", Number)
], CreateCheckInDto.prototype, "checkInLatitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: -74.0060
    }),
    __metadata("design:type", Number)
], CreateCheckInDto.prototype, "checkInLongitude", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: String,
        required: false,
        example: 'Notes'
    }),
    __metadata("design:type", String)
], CreateCheckInDto.prototype, "checkInNotes", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the attendance check in'
    }),
    __metadata("design:type", Object)
], CreateCheckInDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The owner reference code of the attendance check in'
    }),
    __metadata("design:type", Object)
], CreateCheckInDto.prototype, "owner", void 0);
//# sourceMappingURL=create-attendance-check-in.dto.js.map