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
exports.CreateTaskDto = exports.SubtaskDto = exports.ClientDto = exports.CreatorDto = exports.AssigneeDto = void 0;
const class_validator_1 = require("class-validator");
const task_enums_1 = require("../../lib/enums/task.enums");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AssigneeDto {
}
exports.AssigneeDto = AssigneeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], AssigneeDto.prototype, "uid", void 0);
class CreatorDto {
}
exports.CreatorDto = CreatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creator ID', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatorDto.prototype, "uid", void 0);
class ClientDto {
}
exports.ClientDto = ClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client ID', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ClientDto.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client name', example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClientDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client email', example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client contact person' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClientDto.prototype, "contactPerson", void 0);
class SubtaskDto {
}
exports.SubtaskDto = SubtaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subtask title', example: 'Sub Task One' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubtaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subtask description', example: 'Sub task description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubtaskDto.prototype, "description", void 0);
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The title of the task',
        example: 'Test Task',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The description of the task',
        example: 'Test description',
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
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.TaskPriority),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The deadline for the task completion',
        example: `${new Date()}`,
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'How often the task should repeat',
        enum: task_enums_1.RepetitionType,
        example: task_enums_1.RepetitionType.MONTHLY,
    }),
    (0, class_validator_1.IsEnum)(task_enums_1.RepetitionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "repetitionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The deadline for task repetition',
        example: `${new Date()}`,
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "repetitionDeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of assignees',
        type: [AssigneeDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AssigneeDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "assignees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of clients',
        type: [ClientDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ClientDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target category for bulk client assignment',
        example: 'enterprise',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "targetCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of subtasks',
        type: [SubtaskDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SubtaskDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "subtasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of file attachments for the task',
        example: ['https://cdn-icons-png.flaticon.com/512/3607/3607444.png'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of creators',
        type: [CreatorDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatorDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "creators", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Comments',
        example: 'Just a testing task',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organisation ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "organisationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "branchId", void 0);
//# sourceMappingURL=create-task.dto.js.map