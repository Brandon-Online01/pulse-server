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
exports.CreateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const task_enums_1 = require("../../lib/enums/task.enums");
const swagger_1 = require("@nestjs/swagger");
const status_enums_1 = require("../../lib/enums/status.enums");
const create_subtask_dto_1 = require("./create-subtask.dto");
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: 'Task comment', description: 'Comment of the task' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ example: 'Task notes', description: 'Notes of the task' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: 'Task description', description: 'Description of the task' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(status_enums_1.GeneralStatus),
    (0, swagger_1.ApiProperty)({ example: status_enums_1.GeneralStatus.ACTIVE, description: 'Status of the task' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: { uid: 1 }, description: 'Owner of the task' }),
    __metadata("design:type", Object)
], CreateTaskDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(task_enums_1.TaskType),
    (0, swagger_1.ApiProperty)({ example: task_enums_1.TaskType.OTHER, description: 'Type of the task' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Deadline of the task' }),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: { uid: 1 }, description: 'Branch of the task' }),
    __metadata("design:type", Object)
], CreateTaskDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(task_enums_1.Priority),
    (0, swagger_1.ApiProperty)({ example: task_enums_1.Priority.MEDIUM, description: 'Priority of the task' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Progress of the task' }),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "progress", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)({ example: [{ uid: 1 }, { uid: 2 }] }),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "assignees", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(task_enums_1.RepetitionType),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: task_enums_1.RepetitionType.DAILY,
        description: 'Type of repetition'
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "repetitionType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: `${new Date()}`,
        description: 'Date of the last repetition'
    }),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "repetitionEndDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'tasklist.pdf',
        description: 'Attachments of the task'
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, swagger_1.ApiProperty)({
        example: create_subtask_dto_1.CreateSubtaskDto,
        description: 'Subtasks of the task',
        type: [create_subtask_dto_1.CreateSubtaskDto]
    }),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "subtasks", void 0);
//# sourceMappingURL=create-task.dto.js.map