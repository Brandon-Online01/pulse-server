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
exports.UpdateTrackingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_tracking_dto_1 = require("./create-tracking.dto");
const class_validator_1 = require("class-validator");
const class_validator_2 = require("class-validator");
class UpdateTrackingDto extends (0, swagger_1.PartialType)(create_tracking_dto_1.CreateTrackingDto) {
}
exports.UpdateTrackingDto = UpdateTrackingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude coordinate',
        example: -33.9249,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude coordinate',
        example: 18.4241,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Speed in meters per second',
        example: 5.7,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "speed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Heading in degrees (0-360)',
        example: 180.5,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Altitude in meters above sea level',
        example: 100.2,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "altitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accuracy of the GPS reading in meters',
        example: 10.5,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "accuracy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Altitude accuracy in meters',
        example: -1,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "altitudeAccuracy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp in milliseconds',
        example: 1740670776637,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Battery level percentage (-1 to 100)',
        example: -1,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "batteryLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Battery state (0: unknown, 1: charging, 2: discharging, etc.)',
        example: 0,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "batteryState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device brand',
        example: 'Apple',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device manufacturer',
        example: 'Apple',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device model ID',
        example: 'arm64',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "modelID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Device model name',
        example: 'Simulator iOS',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "modelName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operating system name',
        example: 'iOS',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "osName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operating system version',
        example: '18.1',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "osVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Network information',
        example: { ipAddress: '192.168.0.189', state: { isConnected: true, isInternetReachable: true, type: 'WIFI' } },
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTrackingDto.prototype, "network", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the device',
        example: 'DEV123456',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the device',
        example: 'iPhone 13 Pro',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MAC address of the device',
        example: '00:1A:2B:3C:4D:5E',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "macAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Signal strength in dBm',
        example: -65,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "signalStrength", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracking device is currently active',
        example: true,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTrackingDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the tracking device',
        example: 'ONLINE',
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional metadata for the tracking record',
        example: { taskId: 123, clientId: 456 },
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTrackingDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch associated with this tracking record',
        example: { uid: 1 },
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTrackingDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User who owns this tracking record',
        example: 1,
        required: false
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTrackingDto.prototype, "owner", void 0);
//# sourceMappingURL=update-tracking.dto.js.map