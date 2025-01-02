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
exports.CreateTrackingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTrackingDto {
}
exports.CreateTrackingDto = CreateTrackingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Latitude',
        example: 121.4737,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Longitude',
        example: 121.4737,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Speed in specified units',
        example: 45.50,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "speed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Heading direction in degrees',
        example: 180.00,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "heading", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Altitude in meters',
        example: 1250.75,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "altitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Location accuracy in meters',
        example: 10.5,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "accuracy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the device',
        example: 'DEV123456',
        required: false,
    }),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Name of the device',
        example: 'iPhone 12 Pro',
        required: false,
    }),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "deviceName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'MAC address of the device',
        example: '00:11:22:33:44:55',
        required: false,
    }),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "macAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Battery level percentage',
        example: 85.5,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "batteryLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Signal strength indicator',
        example: -65,
        required: false,
    }),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "signalStrength", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracking record is active',
        example: true,
        default: true,
    }),
    __metadata("design:type", Boolean)
], CreateTrackingDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the tracking',
        example: 'ACTIVE',
        required: false,
    }),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'Additional metadata about the tracking event',
        example: {
            browser: 'Chrome',
            ip: '192.168.1.1',
            customField: 'value'
        },
        required: false,
    }),
    __metadata("design:type", Object)
], CreateTrackingDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the tracking'
    }),
    __metadata("design:type", Object)
], CreateTrackingDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The owner reference code of the journal',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], CreateTrackingDto.prototype, "owner", void 0);
//# sourceMappingURL=create-tracking.dto.js.map