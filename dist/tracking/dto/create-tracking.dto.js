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
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTrackingDto {
}
exports.CreateTrackingDto = CreateTrackingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The user ID who owns this tracking record',
        example: 1,
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude coordinate',
        example: -33.9249,
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude coordinate',
        example: 18.4241,
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Physical address of the location (optional)',
        example: '123 Main St, Cape Town, South Africa',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes about this tracking point (optional)',
        example: 'Client meeting location',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Distance traveled in meters (optional)',
        example: 1500.5,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Duration in seconds (optional)',
        example: 600,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accuracy of the GPS reading in meters',
        example: 5,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "accuracy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Altitude in meters above sea level',
        example: 100.2,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "altitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Altitude accuracy in meters',
        example: -1,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "altitudeAccuracy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Heading in degrees (0-360)',
        example: -1,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Speed in meters per second',
        example: -1,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "speed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp in milliseconds',
        example: 1740670776637,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Battery level percentage (-1 to 100)',
        example: -1,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "batteryLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Battery state (0: unknown, 1: charging, 2: discharging, etc.)',
        example: 0,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTrackingDto.prototype, "batteryState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device brand',
        example: 'Apple',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device manufacturer',
        example: 'Apple',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device model ID',
        example: 'arm64',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "modelID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device model name',
        example: 'Simulator iOS',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "modelName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operating system name',
        example: 'iOS',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "osName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operating system version',
        example: '18.1',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrackingDto.prototype, "osVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Network information',
        example: { ipAddress: '192.168.0.189', state: { isConnected: true, isInternetReachable: true, type: 'WIFI' } },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTrackingDto.prototype, "network", void 0);
//# sourceMappingURL=create-tracking.dto.js.map