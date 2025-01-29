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
const class_transformer_1 = require("class-transformer");
const create_subtask_dto_1 = require("./create-subtask.dto");
const swagger_1 = require("@nestjs/swagger");
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The title of the task',
        example: 'Client Meeting - Q1 Review',
        required: true
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The description of the task',
        example: 'Quarterly review meeting with client to discuss progress and future plans',
        required: true
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of task',
        enum: task_enums_1.TaskType,
        example: task_enums_1.TaskType.IN_PERSON_MEETING,
        required: true
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The priority level of the task',
        enum: task_enums_1.TaskPriority,
        example: task_enums_1.TaskPriority.HIGH,
        required: true
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskPriority),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The deadline for the task completion',
        example: '2024-02-28T16:00:00.000Z',
        required: true
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'How often the task should repeat',
        enum: task_enums_1.RepetitionType,
        example: task_enums_1.RepetitionType.WEEKLY,
        required: true
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.RepetitionType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "repetitionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date until which the task should repeat',
        example: '2024-03-28T16:00:00.000Z',
        required: false
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "repetitionEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of file attachments for the task',
        example: ['report.pdf', 'presentation.pptx'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of user objects assigned to the task',
        example: [{ uid: 1 }, { uid: 2 }],
        required: true,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                uid: { type: 'number' }
            }
        }
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "assignees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client object associated with the task (optional if targetCategory is provided)',
        example: { uid: 1 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateTaskDto.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target category for bulk client assignment. If provided, task will be assigned to all clients in this category',
        example: 'premium',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "targetCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of subtasks',
        type: [create_subtask_dto_1.CreateSubtaskDto],
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "subtasks", void 0);
//# sourceMappingURL=create-task.dto.js.map