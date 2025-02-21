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
const class_validator_1 = require("class-validator");
const task_enums_1 = require("../../lib/enums/task.enums");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const create_task_dto_1 = require("./create-task.dto");
class UpdateTaskDto {
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The title of the task',
        example: 'Test Task'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The description of the task',
        example: 'Test description'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The current status of the task',
        enum: task_enums_1.TaskStatus,
        example: task_enums_1.TaskStatus.IN_PROGRESS
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of task',
        enum: task_enums_1.TaskType,
        example: task_enums_1.TaskType.IN_PERSON_MEETING
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The priority level of the task',
        enum: task_enums_1.TaskPriority,
        example: task_enums_1.TaskPriority.HIGH
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The deadline for the task completion',
        example: new Date().toISOString()
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
        example: task_enums_1.RepetitionType.MONTHLY
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.RepetitionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "repetitionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The deadline for task repetition',
        example: new Date().toISOString()
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateTaskDto.prototype, "repetitionDeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task progress percentage',
        example: 50
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTaskDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of file attachments for the task',
        example: ['https://cdn-icons-png.flaticon.com/512/3607/3607444.png'],
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of assignees',
        type: [create_task_dto_1.AssigneeDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_task_dto_1.AssigneeDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "assignees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of clients',
        type: [create_task_dto_1.ClientDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_task_dto_1.ClientDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target category for bulk client assignment',
        example: 'enterprise'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "targetCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of subtasks',
        type: [create_task_dto_1.SubtaskDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_task_dto_1.SubtaskDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "subtasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of creators',
        type: [create_task_dto_1.CreatorDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_task_dto_1.CreatorDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "creators", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Comments',
        example: 'Just a testing task'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "comment", void 0);
//# sourceMappingURL=update-task.dto.js.map