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
exports.UpdateAttendanceDto = void 0;
const class_validator_1 = require("class-validator");
const attendance_enums_1 = require("../../lib/enums/attendance.enums");
const class_validator_2 = require("class-validator");
const class_validator_3 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateAttendanceDto {
}
exports.UpdateAttendanceDto = UpdateAttendanceDto;
__decorate([
    (0, class_validator_3.IsEnum)(attendance_enums_1.AttendanceStatus),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        enum: attendance_enums_1.AttendanceStatus,
        required: false,
        example: attendance_enums_1.AttendanceStatus.PRESENT,
        default: attendance_enums_1.AttendanceStatus.PRESENT,
        description: 'Attendance status of the employee (PRESENT, ABSENT, LATE, etc)'
    }),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Date,
        required: false,
        example: `${new Date()}`,
        description: 'Date and time when employee checked in'
    }),
    __metadata("design:type", Date)
], UpdateAttendanceDto.prototype, "checkIn", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Date,
        required: false,
        example: `${new Date()}`,
        description: 'Date and time when employee checked out'
    }),
    __metadata("design:type", Date)
], UpdateAttendanceDto.prototype, "checkOut", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: 10,
        description: 'Duration of attendance in minutes'
    }),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: 40.7128,
        description: 'Latitude coordinate of check-in location'
    }),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkInLatitude", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: -74.0060,
        description: 'Longitude coordinate of check-in location'
    }),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkInLongitude", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: 40.7128,
        description: 'Latitude coordinate of check-out location'
    }),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkOutLatitude", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: Number,
        required: false,
        example: -74.0060,
        description: 'Longitude coordinate of check-out location'
    }),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkOutLongitude", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: String,
        required: false,
        example: 'Notes',
        description: 'Additional notes or comments recorded during check-out'
    }),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "checkOutNotes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        type: String,
        required: false,
        example: { uid: 1 },
        description: 'Reference code to identify the employee'
    }),
    __metadata("design:type", Object)
], UpdateAttendanceDto.prototype, "owner", void 0);
//# sourceMappingURL=update-attendance.dto.js.map