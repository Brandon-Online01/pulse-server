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
exports.UpdateSubtaskDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_subtask_dto_1 = require("./create-subtask.dto");
const class_validator_1 = require("class-validator");
const status_enums_1 = require("../../lib/enums/status.enums");
class UpdateSubtaskDto extends (0, swagger_1.PartialType)(create_subtask_dto_1.CreateSubtaskDto) {
}
exports.UpdateSubtaskDto = UpdateSubtaskDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'Attendance & Dress Code',
        description: 'Title of the subtask'
    }),
    __metadata("design:type", String)
], UpdateSubtaskDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'Check employee attendance and dress code',
        description: 'Description of the subtask'
    }),
    __metadata("design:type", String)
], UpdateSubtaskDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(status_enums_1.SubTaskStatus),
    (0, swagger_1.ApiProperty)({
        example: status_enums_1.SubTaskStatus.PENDING,
        description: 'Status of the subtask'
    }),
    __metadata("design:type", String)
], UpdateSubtaskDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Is the subtask deleted'
    }),
    __metadata("design:type", Boolean)
], UpdateSubtaskDto.prototype, "isDeleted", void 0);
//# sourceMappingURL=update-subtask.dto.js.map