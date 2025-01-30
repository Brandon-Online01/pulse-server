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
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_3 = require("typeorm");
const status_enums_1 = require("../lib/enums/status.enums");
const task_entity_1 = require("./entities/task.entity");
const subtask_entity_1 = require("./entities/subtask.entity");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
const date_fns_1 = require("date-fns");
const client_entity_1 = require("../clients/entities/client.entity");
const common_1 = require("@nestjs/common");
const notification_enums_1 = require("../lib/enums/notification.enums");
const task_enums_1 = require("../lib/enums/task.enums");
let TasksService = class TasksService {
    constructor(taskRepository, subtaskRepository, eventEmitter, rewardsService, clientRepository) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.eventEmitter = eventEmitter;
        this.rewardsService = rewardsService;
        this.clientRepository = clientRepository;
    }
    async createRepeatingTasks(baseTask, createTaskDto) {
        if (!createTaskDto.repetitionType || createTaskDto.repetitionType === task_enums_1.RepetitionType.NONE || !createTaskDto.deadline || !createTaskDto.repetitionEndDate) {
            return;
        }
        let currentDate = new Date(createTaskDto.deadline);
        const endDate = new Date(createTaskDto.repetitionEndDate);
        let tasksCreated = 0;
        while (currentDate < endDate) {
            let nextDate;
            switch (createTaskDto.repetitionType) {
                case task_enums_1.RepetitionType.DAILY:
                    nextDate = (0, date_fns_1.addDays)(currentDate, 1);
                    break;
                case task_enums_1.RepetitionType.WEEKLY:
                    nextDate = (0, date_fns_1.addWeeks)(currentDate, 1);
                    break;
                case task_enums_1.RepetitionType.MONTHLY:
                    nextDate = (0, date_fns_1.addMonths)(currentDate, 1);
                    break;
                case task_enums_1.RepetitionType.YEARLY:
                    nextDate = (0, date_fns_1.addYears)(currentDate, 1);
                    break;
                default:
                    return;
            }
            if (nextDate > endDate) {
                break;
            }
            const repeatedTask = new task_entity_1.Task();
            repeatedTask.title = `${createTaskDto.title} (${tasksCreated + 1} of ${createTaskDto.repetitionType})`;
            repeatedTask.description = createTaskDto.description;
            repeatedTask.deadline = nextDate;
            repeatedTask.assignees = baseTask.assignees;
            repeatedTask.clients = baseTask.clients;
            repeatedTask.status = task_enums_1.TaskStatus.PENDING;
            repeatedTask.taskType = createTaskDto.taskType || task_enums_1.TaskType.OTHER;
            repeatedTask.priority = createTaskDto.priority;
            repeatedTask.attachments = createTaskDto.attachments;
            repeatedTask.lastCompletedAt = null;
            repeatedTask.repetitionType = task_enums_1.RepetitionType.NONE;
            repeatedTask.repetitionEndDate = null;
            repeatedTask.createdBy = baseTask.createdBy;
            await this.taskRepository.save(repeatedTask);
            currentDate = nextDate;
            tasksCreated++;
        }
    }
    async create(createTaskDto) {
        try {
            const now = new Date();
            if (createTaskDto.deadline && new Date(createTaskDto.deadline) < now) {
                throw new common_1.BadRequestException('Task deadline cannot be in the past');
            }
            if (createTaskDto.repetitionEndDate && new Date(createTaskDto.repetitionEndDate) < now) {
                throw new common_1.BadRequestException('Repetition end date cannot be in the past');
            }
            const taskData = {
                ...createTaskDto,
                status: task_enums_1.TaskStatus.PENDING,
                progress: 0,
                assignees: createTaskDto.assignees || [],
                clients: [],
                attachments: []
            };
            const clientUids = new Set();
            if (createTaskDto.client?.uid) {
                clientUids.add(createTaskDto.client.uid);
            }
            if (createTaskDto.targetCategory) {
                const categoryClients = await this.clientRepository.find({
                    where: {
                        category: createTaskDto.targetCategory,
                        isDeleted: false
                    },
                    select: ['uid']
                });
                categoryClients.forEach(client => clientUids.add(client.uid));
            }
            if (clientUids.size > 0) {
                taskData.clients = Array.from(clientUids).map(uid => ({ uid }));
            }
            const task = await this.taskRepository.save(taskData);
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (createTaskDto.repetitionType !== task_enums_1.RepetitionType.NONE) {
                await this.createRepeatingTasks(task, createTaskDto);
            }
            if (createTaskDto?.subtasks?.length > 0) {
                const subtasks = createTaskDto.subtasks.map(subtask => ({
                    ...subtask,
                    task: { uid: task.uid },
                    status: status_enums_1.SubTaskStatus.PENDING
                }));
                await this.subtaskRepository.save(subtasks);
            }
            if (taskData.assignees?.length > 0) {
                const notification = {
                    type: notification_enums_1.NotificationType.USER,
                    title: 'New Task Assignment',
                    message: `You have been assigned to: ${task.title}`,
                    status: notification_enums_1.NotificationStatus.UNREAD,
                    owner: null
                };
                taskData.assignees.forEach(assignee => {
                    this.eventEmitter.emit('send.notification', {
                        ...notification,
                        owner: assignee,
                        metadata: {
                            taskId: task.uid,
                            deadline: task.deadline,
                            priority: task.priority
                        }
                    }, [assignee.uid]);
                });
            }
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message);
        }
    }
    async findAll(filters) {
        try {
            const queryBuilder = this.taskRepository
                .createQueryBuilder('task')
                .leftJoinAndSelect('task.createdBy', 'createdBy')
                .leftJoinAndSelect('task.assignees', 'assignees')
                .leftJoinAndSelect('task.clients', 'clients')
                .leftJoinAndSelect('task.subtasks', 'subtasks')
                .where('task.isDeleted = :isDeleted', { isDeleted: false });
            if (filters?.status) {
                queryBuilder.andWhere('task.status = :status', { status: filters.status });
            }
            if (filters?.priority) {
                queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
            }
            if (filters?.assigneeId) {
                queryBuilder.andWhere('assignees.uid = :assigneeId', { assigneeId: filters.assigneeId });
            }
            if (filters?.clientId) {
                queryBuilder.andWhere('clients.uid = :clientId', { clientId: filters.clientId });
            }
            if (filters?.startDate && filters?.endDate) {
                queryBuilder.andWhere('task.deadline BETWEEN :startDate AND :endDate', {
                    startDate: filters.startDate,
                    endDate: filters.endDate
                });
            }
            if (filters?.isOverdue !== undefined) {
                queryBuilder.andWhere('task.isOverdue = :isOverdue', { isOverdue: filters.isOverdue });
            }
            const tasks = await queryBuilder.getMany();
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
                    'createdBy',
                    'branch',
                    'clients',
                    'subtasks',
                    'assignees'
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
                where: { createdBy: { uid: ref }, isDeleted: false },
                relations: [
                    'createdBy',
                    'branch',
                    'clients',
                    'subtasks',
                    'assignees'
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
                relations: ['assignees', 'subtasks', 'createdBy']
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const updateData = {
                title: updateTaskDto.title,
                description: updateTaskDto.description,
                status: updateTaskDto.status,
                taskType: updateTaskDto.taskType,
                deadline: updateTaskDto.deadline,
                priority: updateTaskDto.priority,
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
                message: `Task "${task.title}" has been updated`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: null
            };
            const recipientIds = [
                task.createdBy.uid,
                ...(task.assignees?.map(assignee => assignee.uid) || [])
            ];
            const uniqueRecipientIds = [...new Set(recipientIds)];
            uniqueRecipientIds.forEach(recipientId => {
                this.eventEmitter.emit('send.notification', {
                    ...notification,
                    owner: { uid: recipientId }
                }, [recipientId]);
            });
            await this.rewardsService.awardXP({
                owner: task.createdBy.uid,
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
                [task_enums_1.TaskStatus.PENDING]: 0,
                [task_enums_1.TaskStatus.IN_PROGRESS]: 0,
                [task_enums_1.TaskStatus.COMPLETED]: 0,
                [task_enums_1.TaskStatus.CANCELLED]: 0,
                [task_enums_1.TaskStatus.OVERDUE]: 0,
                [task_enums_1.TaskStatus.POSTPONED]: 0,
                [task_enums_1.TaskStatus.MISSED]: 0
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
                byStatus: Object.values(task_enums_1.TaskStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {}),
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
    async updateProgress(ref, progress) {
        try {
            const task = await this.taskRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['assignees', 'createdBy']
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (progress < 0 || progress > 100) {
                throw new common_1.BadRequestException('Progress must be between 0 and 100');
            }
            task.progress = progress;
            await this.taskRepository.save(task);
            if (progress === 100) {
                const notification = {
                    type: notification_enums_1.NotificationType.USER,
                    title: 'Task Completed',
                    message: `Task "${task.title}" has been marked as complete`,
                    status: notification_enums_1.NotificationStatus.UNREAD,
                    owner: null
                };
                const recipients = [
                    task.createdBy.uid,
                    ...(task.assignees?.map(assignee => assignee.uid) || [])
                ];
                const uniqueRecipients = [...new Set(recipients)];
                uniqueRecipients.forEach(recipientId => {
                    this.eventEmitter.emit('send.notification', {
                        ...notification,
                        owner: { uid: recipientId },
                        metadata: {
                            taskId: task.uid,
                            completedAt: new Date()
                        }
                    }, [recipientId]);
                });
            }
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message);
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_2.InjectRepository)(subtask_entity_1.SubTask)),
    __param(4, (0, typeorm_2.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        event_emitter_1.EventEmitter2,
        rewards_service_1.RewardsService,
        typeorm_1.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map