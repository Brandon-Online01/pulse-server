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
const subtask_entity_1 = require("./subtask.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const client_entity_1 = require("../../clients/entities/client.entity");
const task_enums_1 = require("../../lib/enums/task.enums");
const typeorm_1 = require("typeorm");
let Task = class Task {
    setInitialStatus() {
        this.status = task_enums_1.TaskStatus.PENDING;
        this.progress = 0;
        if (!this.startDate) {
            this.startDate = new Date();
        }
    }
    updateStatus() {
        const now = new Date();
        if (this.deadline && now > this.deadline && this.status !== task_enums_1.TaskStatus.COMPLETED) {
            this.status = task_enums_1.TaskStatus.OVERDUE;
            this.isOverdue = true;
        }
        if (this.progress === 100 && this.status !== task_enums_1.TaskStatus.COMPLETED) {
            this.status = task_enums_1.TaskStatus.COMPLETED;
            this.lastCompletedAt = now;
        }
        else if (this.progress > 0 && this.progress < 100 && this.status === task_enums_1.TaskStatus.PENDING) {
            this.status = task_enums_1.TaskStatus.IN_PROGRESS;
        }
        if (this.status === task_enums_1.TaskStatus.COMPLETED) {
            this.isOverdue = false;
        }
    }
};
exports.Task = Task;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Task.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enums_1.TaskStatus, default: task_enums_1.TaskStatus.PENDING }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enums_1.TaskType, default: task_enums_1.TaskType.OTHER }),
    __metadata("design:type", String)
], Task.prototype, "taskType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enums_1.TaskPriority, default: task_enums_1.TaskPriority.MEDIUM }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Task.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enums_1.RepetitionType, default: task_enums_1.RepetitionType.NONE }),
    __metadata("design:type", String)
], Task.prototype, "repetitionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "repetitionEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "lastCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isOverdue", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.User)
], Task.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({
        name: 'task_assignees',
        joinColumn: { name: 'taskUid', referencedColumnName: 'uid' },
        inverseJoinColumn: { name: 'userUid', referencedColumnName: 'uid' }
    }),
    __metadata("design:type", Array)
], Task.prototype, "assignees", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => client_entity_1.Client),
    (0, typeorm_1.JoinTable)({
        name: 'task_clients',
        joinColumn: { name: 'taskUid', referencedColumnName: 'uid' },
        inverseJoinColumn: { name: 'clientUid', referencedColumnName: 'uid' }
    }),
    __metadata("design:type", Array)
], Task.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subtask_entity_1.SubTask, subtask => subtask.task),
    __metadata("design:type", Array)
], Task.prototype, "subtasks", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Task.prototype, "setInitialStatus", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Task.prototype, "updateStatus", null);
exports.Task = Task = __decorate([
    (0, typeorm_1.Entity)('tasks')
], Task);
//# sourceMappingURL=task.entity.js.map