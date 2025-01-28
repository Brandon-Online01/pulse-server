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
exports.UpdateTaskDto = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const create_subtask_dto_1 = require("./create-subtask.dto");
const class_validator_1 = require("class-validator");
const task_enums_1 = require("../../lib/enums/task.enums");
class UpdateTaskDto {
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The title of the task',
        example: 'Client Meeting - Q1 Review (Updated)',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The description of the task',
        example: 'Updated quarterly review meeting details and agenda',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The current status of the task',
        enum: task_enums_1.TaskStatus,
        example: task_enums_1.TaskStatus.IN_PROGRESS,
        required: false
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of task',
        enum: task_enums_1.TaskType,
        example: task_enums_1.TaskType.MEETING,
        required: false
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The priority level of the task',
        enum: task_enums_1.TaskPriority,
        example: task_enums_1.TaskPriority.HIGH,
        required: false
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The deadline for the task completion',
        example: '2024-02-28T16:00:00.000Z',
        required: false
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateTaskDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'How often the task should repeat',
        enum: task_enums_1.RepetitionType,
        example: task_enums_1.RepetitionType.WEEKLY,
        required: false
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.RepetitionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "repetitionType", void 0);
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
], UpdateTaskDto.prototype, "repetitionEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of file attachments for the task',
        example: ['updated-report.pdf', 'final-presentation.pptx'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of user objects assigned to the task',
        example: [{ uid: 1 }, { uid: 2 }],
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                uid: { type: 'number' }
            }
        }
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "assignees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of client objects associated with the task',
        example: [{ uid: 1 }, { uid: 2 }],
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                uid: { type: 'number' }
            }
        }
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "clients", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of subtasks',
        type: [create_subtask_dto_1.CreateSubtaskDto],
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "subtasks", void 0);
//# sourceMappingURL=update-task.dto.js.map