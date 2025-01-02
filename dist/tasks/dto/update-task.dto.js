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
const swagger_1 = require("@nestjs/swagger");
const create_task_dto_1 = require("./create-task.dto");
const class_validator_1 = require("class-validator");
const task_enums_1 = require("../../lib/enums/task.enums");
const create_subtask_dto_1 = require("./create-subtask.dto");
class UpdateTaskDto extends (0, swagger_1.PartialType)(create_task_dto_1.CreateTaskDto) {
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The owner of the task'
    }),
    __metadata("design:type", Object)
], UpdateTaskDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(task_enums_1.TaskType),
    (0, swagger_1.ApiProperty)({
        example: task_enums_1.TaskType.OTHER,
        description: 'The type of the task'
    }),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        example: `${new Date()}`,
        description: 'The deadline of the task'
    }),
    __metadata("design:type", Date)
], UpdateTaskDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the task'
    }),
    __metadata("design:type", Object)
], UpdateTaskDto.prototype, "branch", void 0);
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
], UpdateTaskDto.prototype, "subtasks", void 0);
//# sourceMappingURL=update-task.dto.js.map