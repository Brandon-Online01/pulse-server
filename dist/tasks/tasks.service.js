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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_3 = require("typeorm");
const notification_enums_1 = require("../lib/enums/notification.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const notification_enums_2 = require("../lib/enums/notification.enums");
const status_enums_1 = require("../lib/enums/status.enums");
const task_entity_1 = require("./entities/task.entity");
const subtask_entity_1 = require("./entities/subtask.entity");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
let TasksService = class TasksService {
    constructor(taskRepository, subtaskRepository, eventEmitter, rewardsService) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.eventEmitter = eventEmitter;
        this.rewardsService = rewardsService;
    }
    async create(createTaskDto) {
        try {
            const assignees = createTaskDto?.assignees?.map(assignee => ({ uid: assignee?.uid }));
            const task = await this.taskRepository.save({
                ...createTaskDto,
                assignees: assignees
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (createTaskDto?.subtasks && createTaskDto?.subtasks?.length > 0) {
                const subtasks = createTaskDto?.subtasks?.map(subtask => ({
                    ...subtask,
                    task: { uid: task?.uid }
                }));
                await this.subtaskRepository.save(subtasks);
            }
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Task Created',
                message: `A task has been created`,
                status: notification_enums_2.NotificationStatus.UNREAD,
                owner: task?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async findAll() {
        try {
            const tasks = await this.taskRepository.find({
                where: { isDeleted: false },
                relations: [
                    'owner',
                    'branch',
                    'client',
                    'subtasks'
                ]
            });
            if (!tasks) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            return {
                tasks,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                tasks: null
            };
        }
    }
    async findOne(ref) {
        try {
            const task = await this.taskRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: [
                    'owner',
                    'branch',
                    'client',
                    'subtasks'
                ]
            });
            if (!task) {
                return {
                    task: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            return {
                task,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                task: null
            };
        }
    }
    async tasksByUser(ref) {
        try {
            const tasks = await this.taskRepository.find({
                where: { owner: { uid: ref }, isDeleted: false },
                relations: [
                    'owner',
                    'branch',
                    'client',
                    'subtasks'
                ]
            });
            if (!tasks) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                tasks
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get tasks by user - ${error?.message}`,
                tasks: null
            };
            return response;
        }
    }
    async update(ref, updateTaskDto) {
        try {
            const task = await this.taskRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['assignees', 'subtasks']
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const updateData = {
                comment: updateTaskDto.comment,
                notes: updateTaskDto.notes,
                description: updateTaskDto.description,
                status: updateTaskDto.status,
                owner: updateTaskDto.owner,
                taskType: updateTaskDto.taskType,
                deadline: updateTaskDto.deadline,
                branch: updateTaskDto.branch,
                priority: updateTaskDto.priority,
                progress: updateTaskDto.progress,
                repetitionType: updateTaskDto.repetitionType,
                repetitionEndDate: updateTaskDto.repetitionEndDate,
                attachments: updateTaskDto.attachments,
            };
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
            if (Object.keys(updateData).length > 0) {
                await this.taskRepository.update({ uid: ref }, updateData);
            }
            if (updateTaskDto.assignees) {
                const taskToUpdate = await this.taskRepository.manager.findOne(task_entity_1.Task, {
                    where: { uid: ref },
                    relations: ['assignees']
                });
                taskToUpdate.assignees = updateTaskDto.assignees.map(assignee => ({ uid: assignee.uid }));
                await this.taskRepository.manager.save(taskToUpdate);
            }
            if (updateTaskDto.subtasks) {
                await this.subtaskRepository.delete({ task: { uid: ref } });
                if (updateTaskDto.subtasks.length > 0) {
                    const subtasks = updateTaskDto.subtasks.map(subtask => ({
                        ...subtask,
                        task: { uid: ref }
                    }));
                    await this.subtaskRepository.save(subtasks);
                }
            }
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Task Updated',
                message: `A task has been updated`,
                status: notification_enums_2.NotificationStatus.UNREAD,
                owner: task.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: task.owner.uid,
                amount: constants_1.XP_VALUES.TASK,
                action: constants_2.XP_VALUES_TYPES.TASK,
                source: {
                    id: task.uid.toString(),
                    type: constants_2.XP_VALUES_TYPES.TASK,
                    details: 'Task reward'
                }
            });
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async remove(ref) {
        try {
            const task = await this.taskRepository.findOne({
                where: { uid: ref, isDeleted: false }
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.taskRepository.update({ uid: ref }, { isDeleted: true });
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async getTaskStatusSummary() {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));
            const tasks = await this.taskRepository.find({
                where: {
                    isDeleted: false,
                    deadline: (0, typeorm_3.Between)(startOfDay, endOfDay)
                },
            });
            const byStatus = {
                [status_enums_1.TaskStatus.POSTPONED]: 0,
                [status_enums_1.TaskStatus.MISSED]: 0,
                [status_enums_1.TaskStatus.COMPLETED]: 0,
                [status_enums_1.TaskStatus.CANCELLED]: 0,
                [status_enums_1.TaskStatus.PENDING]: 0,
                [status_enums_1.TaskStatus.INPROGRESS]: 0
            };
            tasks.forEach(task => {
                if (task.status)
                    byStatus[task.status]++;
            });
            return {
                byStatus,
                total: tasks.length
            };
        }
        catch (error) {
            return {
                byStatus: Object.values(status_enums_1.TaskStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {}),
                total: 0
            };
        }
    }
    async getTasksForDate(date) {
        try {
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const tasks = await this.taskRepository.count({
                where: {
                    createdAt: (0, typeorm_3.Between)(startOfDay, endOfDay),
                    isDeleted: false
                },
                relations: ['subtasks']
            });
            return { total: tasks };
        }
        catch (error) {
            return { total: 0 };
        }
    }
    async findOneSubTask(ref) {
        try {
            const subtask = await this.subtaskRepository.findOne({
                where: { uid: ref, isDeleted: false },
            });
            if (!subtask) {
                return {
                    tasks: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            return {
                tasks: subtask,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                tasks: null
            };
        }
    }
    async updateSubTask(ref, updateSubTaskDto) {
        try {
            await this.subtaskRepository.update(ref, updateSubTaskDto);
            return { message: process.env.SUCCESS_MESSAGE };
        }
        catch (error) {
            return { message: error?.message };
        }
    }
    async deleteSubTask(ref) {
        try {
            await this.subtaskRepository.delete(ref);
            return { message: process.env.SUCCESS_MESSAGE };
        }
        catch (error) {
            return { message: error?.message };
        }
    }
    async completeSubTask(ref) {
        try {
            await this.subtaskRepository.update(ref, { status: status_enums_1.SubTaskStatus.COMPLETED });
            return { message: process.env.SUCCESS_MESSAGE };
        }
        catch (error) {
            return { message: error?.message };
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_2.InjectRepository)(subtask_entity_1.SubTask)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        event_emitter_1.EventEmitter2,
        rewards_service_1.RewardsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map