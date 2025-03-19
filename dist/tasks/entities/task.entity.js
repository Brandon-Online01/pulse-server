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
const task_enums_1 = require("../../lib/enums/task.enums");
const status_enums_1 = require("../../lib/enums/status.enums");
const typeorm_1 = require("typeorm");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const route_entity_1 = require("./route.entity");
const task_flag_entity_1 = require("./task-flag.entity");
let Task = class Task {
    setInitialStatus() {
        this.status = task_enums_1.TaskStatus.PENDING;
        this.progress = 0;
        this.jobStatus = task_enums_1.JobStatus.QUEUED;
    }
    updateStatus() {
        const now = new Date();
        if (this.jobStartTime && this.jobEndTime && !this.jobDuration) {
            const durationMs = this.jobEndTime.getTime() - this.jobStartTime.getTime();
            this.jobDuration = Math.round(durationMs / (1000 * 60));
        }
        if (this.jobStartTime && !this.jobEndTime && this.jobStatus !== task_enums_1.JobStatus.COMPLETED) {
            this.jobStatus = task_enums_1.JobStatus.RUNNING;
        }
        else if (this.jobStartTime && this.jobEndTime) {
            this.jobStatus = task_enums_1.JobStatus.COMPLETED;
        }
        if (this.subtasks?.length > 0) {
            const completedSubtasks = this.subtasks.filter((subtask) => !subtask.isDeleted && subtask.status === status_enums_1.SubTaskStatus.COMPLETED).length;
            const totalSubtasks = this.subtasks.filter((subtask) => !subtask.isDeleted).length;
            this.progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : this.progress;
        }
        if (this.deadline && now > this.deadline && this.status !== task_enums_1.TaskStatus.COMPLETED) {
            this.status = task_enums_1.TaskStatus.OVERDUE;
            this.isOverdue = true;
        }
        if (this.progress === 100 && this.status !== task_enums_1.TaskStatus.COMPLETED) {
            this.status = task_enums_1.TaskStatus.COMPLETED;
            this.completionDate = now;
        }
        else if (this.progress > 0 && this.progress < 100 && this.status === task_enums_1.TaskStatus.PENDING) {
            this.status = task_enums_1.TaskStatus.IN_PROGRESS;
        }
        else if (this.jobStatus === task_enums_1.JobStatus.RUNNING && this.status === task_enums_1.TaskStatus.PENDING) {
            this.status = task_enums_1.TaskStatus.IN_PROGRESS;
        }
        else if (this.jobStatus === task_enums_1.JobStatus.COMPLETED &&
            this.status !== task_enums_1.TaskStatus.COMPLETED &&
            !this.subtasks?.length) {
            this.status = task_enums_1.TaskStatus.COMPLETED;
            this.completionDate = this.jobEndTime || now;
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
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
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
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enums_1.RepetitionType, default: task_enums_1.RepetitionType.NONE }),
    __metadata("design:type", String)
], Task.prototype, "repetitionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Task.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "repetitionDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "completionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isOverdue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "targetCategory", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "jobStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "jobEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "jobDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enums_1.JobStatus, default: task_enums_1.JobStatus.QUEUED }),
    __metadata("design:type", String)
], Task.prototype, "jobStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user?.tasks),
    __metadata("design:type", user_entity_1.User)
], Task.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "assignees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subtask_entity_1.SubTask, (subtask) => subtask.task),
    __metadata("design:type", Array)
], Task.prototype, "subtasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => route_entity_1.Route, (route) => route.task),
    __metadata("design:type", Array)
], Task.prototype, "routes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_flag_entity_1.TaskFlag, (flag) => flag.task),
    __metadata("design:type", Array)
], Task.prototype, "flags", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation.tasks),
    __metadata("design:type", organisation_entity_1.Organisation)
], Task.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch.tasks),
    __metadata("design:type", branch_entity_1.Branch)
], Task.prototype, "branch", void 0);
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