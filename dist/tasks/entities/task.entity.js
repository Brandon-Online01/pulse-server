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
exports.Task = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../../clients/entities/client.entity");
const task_enums_1 = require("../../lib/enums/task.enums");
const status_enums_1 = require("../../lib/enums/status.enums");
const subtask_entity_1 = require("./subtask.entity");
let Task = class Task {
};
exports.Task = Task;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Task.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Task.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 5000 }),
    __metadata("design:type", String)
], Task.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: status_enums_1.GeneralStatus.ACTIVE }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: task_enums_1.TaskType.OTHER }),
    __metadata("design:type", String)
], Task.prototype, "taskType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: task_enums_1.Priority.MEDIUM }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Task.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "repetitionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "repetitionEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "lastCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 5000 }),
    __metadata("design:type", String)
], Task.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user?.tasks),
    __metadata("design:type", user_entity_1.User)
], Task.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.tasks),
    __metadata("design:type", branch_entity_1.Branch)
], Task.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({
        name: 'task_assignees_user',
        joinColumn: { name: 'taskUid', referencedColumnName: 'uid' },
        inverseJoinColumn: { name: 'userUid', referencedColumnName: 'uid' }
    }),
    __metadata("design:type", Array)
], Task.prototype, "assignees", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client, (client) => client?.tasks),
    __metadata("design:type", client_entity_1.Client)
], Task.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subtask_entity_1.SubTask, subtask => subtask?.task),
    __metadata("design:type", Array)
], Task.prototype, "subtasks", void 0);
exports.Task = Task = __decorate([
    (0, typeorm_1.Entity)('task')
], Task);
//# sourceMappingURL=task.entity.js.map