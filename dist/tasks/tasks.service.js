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
const date_fns_1 = require("date-fns");
const client_entity_1 = require("../clients/entities/client.entity");
const common_1 = require("@nestjs/common");
const notification_enums_1 = require("../lib/enums/notification.enums");
const task_enums_1 = require("../lib/enums/task.enums");
const user_entity_1 = require("../user/entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const communication_service_1 = require("../communication/communication.service");
const email_enums_1 = require("../lib/enums/email.enums");
let TasksService = class TasksService {
    constructor(taskRepository, subtaskRepository, eventEmitter, clientRepository, userRepository, cacheManager, configService, communicationService) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.eventEmitter = eventEmitter;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.communicationService = communicationService;
        this.CACHE_PREFIX = 'task:';
        this.CACHE_TTL = this.configService.get('CACHE_EXPIRATION_TIME') || 30;
    }
    getCacheKey(key) {
        return `${this.CACHE_PREFIX}${key}`;
    }
    async clearTaskCache(taskId) {
        try {
            const keys = await this.cacheManager.store.keys();
            const keysToDelete = [];
            if (taskId) {
                keysToDelete.push(this.getCacheKey(taskId));
            }
            const taskListCaches = keys.filter((key) => key.startsWith('tasks_page') ||
                key.startsWith('task:all') ||
                key.includes('_limit'));
            keysToDelete.push(...taskListCaches);
            await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
        }
        catch (error) {
            return error;
        }
    }
    async createRepeatingTasks(baseTask, createTaskDto) {
        if (!createTaskDto.repetitionType ||
            createTaskDto.repetitionType === task_enums_1.RepetitionType.NONE ||
            !createTaskDto.deadline ||
            !createTaskDto.repetitionDeadline) {
            return;
        }
        const startDate = new Date(createTaskDto.deadline);
        const endDate = new Date(createTaskDto.repetitionDeadline);
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('Repetition end date must be after the start date');
        }
        let currentDate = new Date(startDate);
        const totalTasks = this.calculateTotalTasks(startDate, endDate, createTaskDto.repetitionType);
        let tasksCreated = 0;
        const repetitionTypeDisplay = createTaskDto.repetitionType.toLowerCase();
        try {
            const firstTask = await this.createSingleRepeatingTask(baseTask, createTaskDto, startDate, 1, totalTasks, repetitionTypeDisplay, startDate, endDate);
            tasksCreated++;
        }
        catch (error) {
            return error;
        }
        while (currentDate < endDate) {
            try {
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
                await this.createSingleRepeatingTask(baseTask, createTaskDto, nextDate, tasksCreated + 2, totalTasks, repetitionTypeDisplay, startDate, endDate);
                currentDate = nextDate;
                tasksCreated++;
            }
            catch (error) {
                return error;
            }
        }
    }
    async createSingleRepeatingTask(baseTask, createTaskDto, taskDate, sequenceNumber, totalTasks, repetitionTypeDisplay, seriesStart, seriesEnd) {
        const formattedDate = taskDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const repeatedTask = this.taskRepository.create({
            title: `${createTaskDto.title} (#${sequenceNumber}/${totalTasks}) - ${formattedDate}`,
            description: `${createTaskDto.description}\n\n---\nRecurring Task Information:\n- Part ${sequenceNumber} of ${totalTasks}\n- Repeats: ${repetitionTypeDisplay}\n- Original Task: ${createTaskDto.title}\n- Series Start: ${seriesStart.toLocaleDateString()}\n- Series End: ${seriesEnd.toLocaleDateString()}`,
            deadline: taskDate,
            assignees: createTaskDto.assignees?.map((a) => ({ uid: a.uid })) || [],
            clients: createTaskDto.client?.map((c) => ({ uid: c.uid })) || [],
            status: task_enums_1.TaskStatus.PENDING,
            taskType: createTaskDto.taskType || task_enums_1.TaskType.OTHER,
            priority: createTaskDto.priority,
            attachments: createTaskDto.attachments || [],
            completionDate: null,
            repetitionType: task_enums_1.RepetitionType.NONE,
            repetitionDeadline: null,
            creator: baseTask.creator,
            targetCategory: createTaskDto.targetCategory,
            progress: 0,
            isOverdue: false,
            isDeleted: false,
            organisation: baseTask.organisation,
            branch: baseTask.branch,
        });
        const savedTask = await this.taskRepository.save(repeatedTask);
        if (createTaskDto.subtasks?.length > 0) {
            try {
                const subtasks = createTaskDto.subtasks.map((subtask) => ({
                    title: subtask.title,
                    description: subtask.description,
                    status: status_enums_1.SubTaskStatus.PENDING,
                    task: { uid: savedTask.uid },
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));
                const savedSubtasks = await this.subtaskRepository.save(subtasks);
                if (!savedSubtasks) {
                    throw new Error('Failed to save subtasks');
                }
                savedTask.subtasks = savedSubtasks;
                await this.taskRepository.save(savedTask);
            }
            catch (error) {
                throw new Error(`Failed to create subtasks: ${error.message}`);
            }
        }
        this.eventEmitter.emit('task.created', {
            task: savedTask,
            isRecurring: true,
            sequenceNumber,
            totalTasks,
            hasSubtasks: createTaskDto.subtasks?.length > 0,
        });
        await this.clearTaskCache();
        return savedTask;
    }
    calculateTotalTasks(startDate, endDate, repetitionType) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        switch (repetitionType) {
            case task_enums_1.RepetitionType.DAILY:
                return diffDays;
            case task_enums_1.RepetitionType.WEEKLY:
                return Math.ceil(diffDays / 7);
            case task_enums_1.RepetitionType.MONTHLY:
                return Math.ceil(diffDays / 30);
            case task_enums_1.RepetitionType.YEARLY:
                return Math.ceil(diffDays / 365);
            default:
                return 0;
        }
    }
    async create(createTaskDto) {
        try {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (createTaskDto.deadline && new Date(createTaskDto.deadline) < startOfToday) {
                throw new common_1.BadRequestException('Task deadline cannot be in the past');
            }
            if (createTaskDto.repetitionDeadline && new Date(createTaskDto.repetitionDeadline) < startOfToday) {
                throw new common_1.BadRequestException('Repetition end date cannot be in the past');
            }
            try {
                let creator = null;
                if (createTaskDto.creators?.length > 0) {
                    creator = await this.userRepository.findOne({
                        where: { uid: createTaskDto.creators[0].uid },
                        relations: ['organisation', 'branch'],
                    });
                    if (!creator) {
                        throw new common_1.BadRequestException(`Creator with ID ${createTaskDto.creators[0].uid} not found`);
                    }
                }
                const assignees = createTaskDto.assignees?.map((a) => ({ uid: a.uid })) || [];
                const clients = createTaskDto.client?.map((c) => ({ uid: c.uid })) || [];
                const taskData = {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    taskType: createTaskDto.taskType,
                    priority: createTaskDto.priority,
                    status: createTaskDto.status || task_enums_1.TaskStatus.PENDING,
                    progress: createTaskDto.progress || 0,
                    deadline: createTaskDto.deadline ? new Date(createTaskDto.deadline) : null,
                    repetitionType: createTaskDto.repetitionType || task_enums_1.RepetitionType.NONE,
                    repetitionDeadline: createTaskDto.repetitionDeadline
                        ? new Date(createTaskDto.repetitionDeadline)
                        : null,
                    attachments: createTaskDto.attachments || [],
                    targetCategory: createTaskDto.targetCategory,
                    isDeleted: false,
                    isOverdue: false,
                    completionDate: null,
                    creator: creator,
                    organisation: creator?.organisation || null,
                    branch: creator?.branch || null,
                    assignees,
                    clients,
                };
                const task = this.taskRepository.create(taskData);
                const savedTask = await this.taskRepository.save(task);
                if (!savedTask) {
                    throw new Error('Failed to save task');
                }
                if (createTaskDto.subtasks?.length > 0) {
                    try {
                        const subtasks = createTaskDto.subtasks.map((subtask) => ({
                            title: subtask.title,
                            description: subtask.description,
                            status: status_enums_1.SubTaskStatus.PENDING,
                            task: { uid: savedTask.uid },
                            isDeleted: false,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }));
                        const savedSubtasks = await this.subtaskRepository.save(subtasks);
                        if (!savedSubtasks) {
                            throw new Error('Failed to save subtasks');
                        }
                        savedTask.subtasks = savedSubtasks;
                        await this.taskRepository.save(savedTask);
                    }
                    catch (error) {
                        throw new Error(`Failed to create subtasks: ${error.message}`);
                    }
                }
                if (createTaskDto.repetitionType && createTaskDto.repetitionType !== task_enums_1.RepetitionType.NONE) {
                    await this.createRepeatingTasks(savedTask, createTaskDto);
                }
                if (assignees.length > 0) {
                    const assigneeUsers = await this.userRepository.find({
                        where: { uid: (0, typeorm_3.In)(assignees.map((a) => a?.uid)) },
                        select: ['uid', 'email', 'name', 'surname'],
                    });
                    const notification = {
                        type: notification_enums_1.NotificationType.USER,
                        title: 'New Task Assigned',
                        message: `You have been assigned a new task: "${savedTask?.title}"`,
                        status: notification_enums_1.NotificationStatus.UNREAD,
                        metadata: {
                            taskId: savedTask?.uid,
                            priority: savedTask?.priority,
                            deadline: savedTask?.deadline,
                            assignedBy: creator ? `${creator?.name} ${creator?.surname}` : 'System',
                            createdAt: savedTask?.createdAt,
                        },
                    };
                    for (const assignee of assigneeUsers) {
                        this.eventEmitter.emit('send.notification', {
                            ...notification,
                            owner: { uid: assignee?.uid },
                        }, [assignee.uid]);
                        await this.communicationService.sendEmail(email_enums_1.EmailType.NEW_TASK, [assignee.email], {
                            name: `${assignee?.name} ${assignee?.surname}`,
                            taskId: savedTask?.uid?.toString(),
                            title: savedTask?.title,
                            description: savedTask?.description,
                            deadline: savedTask?.deadline?.toISOString(),
                            priority: savedTask?.priority,
                            taskType: savedTask?.taskType,
                            status: savedTask?.status,
                            assignedBy: creator ? `${creator?.name} ${creator?.surname}` : 'System',
                            subtasks: [],
                            clients: clients.length > 0 ? await this.getClientNames(clients.map((c) => c?.uid)) : [],
                            attachments: savedTask.attachments?.map((attachment) => ({
                                name: attachment,
                                url: attachment,
                            })),
                        });
                    }
                }
                await this.clearTaskCache();
                return {
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            catch (error) {
                return error;
            }
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async populateTaskRelations(task) {
        if (task.assignees?.length > 0) {
            const assigneeIds = task.assignees.map((a) => a.uid);
            const assigneeProfiles = await this.userRepository.find({
                where: { uid: (0, typeorm_3.In)(assigneeIds) },
                select: ['uid', 'username', 'name', 'surname', 'email', 'phone', 'photoURL', 'accessLevel', 'status'],
            });
            task.assignees = assigneeProfiles;
        }
        if (task.clients?.length > 0) {
            const clientIds = task.clients.map((c) => c.uid);
            const clientProfiles = await this.clientRepository.find({
                where: { uid: (0, typeorm_3.In)(clientIds) },
            });
            task.clients = clientProfiles;
        }
        return task;
    }
    async findOne(ref) {
        try {
            const cacheKey = this.getCacheKey(ref);
            const cachedTask = await this.cacheManager.get(cacheKey);
            if (cachedTask) {
                return {
                    task: cachedTask,
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            const task = await this.taskRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false,
                },
                relations: ['creator', 'subtasks', 'organisation', 'branch'],
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const populatedTask = await this.populateTaskRelations(task);
            await this.cacheManager.set(cacheKey, populatedTask, this.CACHE_TTL);
            return {
                task: populatedTask,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                task: null,
                message: error?.message,
            };
        }
    }
    async tasksByUser(ref) {
        try {
            const tasks = await this.taskRepository.find({
                where: { creator: { uid: ref }, isDeleted: false },
                relations: ['creator', 'subtasks', 'organisation', 'branch'],
            });
            if (!tasks) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const populatedTasks = await Promise.all(tasks.map((task) => this.populateTaskRelations(task)));
            return {
                message: process.env.SUCCESS_MESSAGE,
                tasks: populatedTasks,
            };
        }
        catch (error) {
            return {
                message: `could not get tasks by user - ${error?.message}`,
                tasks: null,
            };
        }
    }
    async findAll(filters, page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const cacheKey = `tasks_page${page}_limit${limit}_${JSON.stringify(filters)}`;
            const cachedTasks = await this.cacheManager.get(cacheKey);
            if (cachedTasks) {
                return cachedTasks;
            }
            const where = { isDeleted: false };
            if (filters?.status) {
                where.status = filters.status;
            }
            if (filters?.priority) {
                where.priority = filters.priority;
            }
            if (filters?.startDate) {
                where.deadline = (0, typeorm_3.MoreThanOrEqual)(filters.startDate);
            }
            if (filters?.endDate) {
                where.deadline = (0, typeorm_3.LessThanOrEqual)(filters.endDate);
            }
            if (filters?.isOverdue) {
                where.deadline = (0, typeorm_3.LessThan)(new Date());
                where.status = (0, typeorm_3.Not)(task_enums_1.TaskStatus.COMPLETED);
            }
            const [tasks, total] = await this.taskRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                relations: ['creator', 'subtasks', 'organisation', 'branch'],
                take: limit,
                order: {
                    createdAt: 'DESC',
                },
            });
            let filteredTasks = await Promise.all(tasks.map((task) => this.populateTaskRelations(task)));
            if (filters?.assigneeId) {
                filteredTasks = filteredTasks?.filter((task) => task.assignees?.some((assignee) => assignee.uid === filters?.assigneeId));
            }
            if (filters?.clientId) {
                filteredTasks = filteredTasks?.filter((task) => task.clients?.some((client) => client.uid === filters?.clientId));
            }
            const response = {
                data: filteredTasks,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);
            return response;
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
                message: error?.message,
            };
        }
    }
    async update(ref, updateTaskDto) {
        try {
            const task = await this.taskRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false,
                },
                relations: ['subtasks'],
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const taskData = {
                ...updateTaskDto,
            };
            if (updateTaskDto?.assignees) {
                taskData.assignees = updateTaskDto.assignees.map((assignee) => ({
                    uid: assignee.uid,
                }));
            }
            if (updateTaskDto?.client) {
                taskData.clients = updateTaskDto.client.map((client) => ({
                    uid: client.uid,
                }));
            }
            if (updateTaskDto?.creators) {
                taskData.creator = { uid: updateTaskDto.creators[0].uid };
            }
            const entityToSave = this.taskRepository.create({
                ...task,
                ...taskData,
            });
            const savedTask = await this.taskRepository.save(entityToSave);
            if (updateTaskDto.subtasks?.length > 0) {
                if (task.subtasks?.length > 0) {
                    await this.subtaskRepository.delete({ task: { uid: ref } });
                }
                const subtasks = updateTaskDto.subtasks.map((subtask) => this.subtaskRepository.create({
                    title: subtask.title,
                    description: subtask.description,
                    status: subtask.status || status_enums_1.SubTaskStatus.PENDING,
                    task: savedTask,
                    isDeleted: false,
                }));
                await this.subtaskRepository.save(subtasks);
            }
            await this.clearTaskCache(ref);
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
                where: {
                    uid: ref,
                },
                relations: ['subtasks'],
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (task.subtasks?.length > 0) {
                await this.subtaskRepository.update({ task: { uid: ref } }, { isDeleted: true });
            }
            await this.taskRepository.update(ref, { isDeleted: true });
            await this.clearTaskCache(ref);
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
                    deadline: (0, typeorm_3.Between)(startOfDay, endOfDay),
                },
            });
            const byStatus = {
                [task_enums_1.TaskStatus.PENDING]: 0,
                [task_enums_1.TaskStatus.IN_PROGRESS]: 0,
                [task_enums_1.TaskStatus.COMPLETED]: 0,
                [task_enums_1.TaskStatus.CANCELLED]: 0,
                [task_enums_1.TaskStatus.OVERDUE]: 0,
                [task_enums_1.TaskStatus.POSTPONED]: 0,
                [task_enums_1.TaskStatus.MISSED]: 0,
            };
            tasks.forEach((task) => {
                if (task.status)
                    byStatus[task.status]++;
            });
            return {
                byStatus,
                total: tasks.length,
            };
        }
        catch (error) {
            return {
                byStatus: Object.values(task_enums_1.TaskStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {}),
                total: 0,
            };
        }
    }
    async getTasksForDate(date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const tasks = await this.taskRepository.count({
                where: {
                    createdAt: (0, typeorm_3.Between)(startOfDay, endOfDay),
                },
                relations: ['subtasks'],
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
                tasks: null,
            };
        }
    }
    async getParentTaskId(subtaskId) {
        try {
            const subtask = await this.subtaskRepository.findOne({
                where: { uid: subtaskId },
                relations: ['task'],
            });
            return subtask?.task?.uid || null;
        }
        catch (error) {
            return null;
        }
    }
    async updateSubTask(ref, updateSubTaskDto) {
        try {
            await this.subtaskRepository.update(ref, updateSubTaskDto);
            const parentTaskId = await this.getParentTaskId(ref);
            if (parentTaskId) {
                await this.clearTaskCache(parentTaskId);
            }
            return { message: process.env.SUCCESS_MESSAGE };
        }
        catch (error) {
            return { message: error?.message };
        }
    }
    async deleteSubTask(ref) {
        try {
            const parentTaskId = await this.getParentTaskId(ref);
            await this.subtaskRepository.delete(ref);
            if (parentTaskId) {
                await this.clearTaskCache(parentTaskId);
            }
            return { message: process.env.SUCCESS_MESSAGE };
        }
        catch (error) {
            return { message: error?.message };
        }
    }
    async completeSubTask(ref) {
        try {
            await this.subtaskRepository.update(ref, { status: status_enums_1.SubTaskStatus.COMPLETED });
            const parentTaskId = await this.getParentTaskId(ref);
            if (parentTaskId) {
                await this.clearTaskCache(parentTaskId);
            }
            return { message: process.env.SUCCESS_MESSAGE };
        }
        catch (error) {
            return { message: error?.message };
        }
    }
    async updateProgress(ref, progress) {
        try {
            const task = await this.taskRepository.findOne({
                where: { uid: ref },
                relations: ['assignees', 'createdBy'],
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
                    owner: null,
                };
                const recipients = [task.creator[0]?.uid, ...(task.assignees?.map((assignee) => assignee.uid) || [])];
                const uniqueRecipients = [...new Set(recipients)];
                uniqueRecipients.forEach((recipientId) => {
                    this.eventEmitter.emit('send.notification', {
                        ...notification,
                        owner: { uid: recipientId },
                        metadata: {
                            taskId: task.uid,
                            completedAt: new Date(),
                        },
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
    async populateTasksForAnalytics(tasks) {
        return Promise.all(tasks.map((task) => this.populateTaskRelations(task)));
    }
    async getTasksReport(filter) {
        try {
            const tasks = await this.taskRepository.find({
                where: {
                    ...filter,
                    isDeleted: false,
                },
                relations: ['creator', 'subtasks', 'organisation', 'branch'],
            });
            if (!tasks) {
                throw new common_1.NotFoundException('No tasks found for the specified period');
            }
            const populatedTasks = await this.populateTasksForAnalytics(tasks);
            const groupedTasks = {
                pending: populatedTasks.filter((task) => task.status === task_enums_1.TaskStatus.PENDING),
                inProgress: populatedTasks.filter((task) => task.status === task_enums_1.TaskStatus.IN_PROGRESS),
                completed: populatedTasks.filter((task) => task.status === task_enums_1.TaskStatus.COMPLETED),
                overdue: populatedTasks.filter((task) => task.status === task_enums_1.TaskStatus.OVERDUE),
            };
            const totalTasks = populatedTasks.length;
            const completedTasks = groupedTasks.completed.length;
            const avgCompletionTime = this.calculateAverageCompletionTime(populatedTasks);
            const overdueRate = this.calculateOverdueRate(populatedTasks);
            const taskDistribution = this.analyzeTaskDistribution(populatedTasks);
            const incompletionReasons = this.analyzeIncompletionReasons(populatedTasks);
            const clientCompletionRates = await this.analyzeClientCompletionRates(populatedTasks);
            const taskPriorityDistribution = this.analyzeTaskPriorityDistribution(populatedTasks);
            const assigneePerformance = await this.analyzeAssigneePerformance(populatedTasks);
            return {
                ...groupedTasks,
                total: totalTasks,
                metrics: {
                    completionRate: `${((completedTasks / totalTasks) * 100).toFixed(1)}%`,
                    averageCompletionTime: `${avgCompletionTime} hours`,
                    overdueRate: `${overdueRate}%`,
                    taskDistribution,
                    incompletionReasons,
                    clientCompletionRates,
                    taskPriorityDistribution,
                    assigneePerformance,
                },
            };
        }
        catch (error) {
            return null;
        }
    }
    calculateAverageCompletionTime(tasks) {
        const completedTasks = tasks.filter((task) => task.status === task_enums_1.TaskStatus.COMPLETED && task.completionDate);
        if (completedTasks.length === 0)
            return 0;
        const totalCompletionTime = completedTasks.reduce((sum, task) => {
            const completionTime = task.completionDate.getTime() - task.createdAt.getTime();
            return sum + completionTime;
        }, 0);
        return Number((totalCompletionTime / (completedTasks.length * 60 * 60 * 1000)).toFixed(1));
    }
    calculateOverdueRate(tasks) {
        if (tasks.length === 0)
            return 0;
        const overdueTasks = tasks.filter((task) => task.isOverdue || task.status === task_enums_1.TaskStatus.OVERDUE).length;
        return Number(((overdueTasks / tasks.length) * 100).toFixed(1));
    }
    analyzeTaskDistribution(tasks) {
        const distribution = Object.values(task_enums_1.TaskType).reduce((acc, type) => {
            acc[type] = 0;
            return acc;
        }, {});
        tasks.forEach((task) => {
            distribution[task.taskType] = (distribution[task.taskType] || 0) + 1;
        });
        return distribution;
    }
    analyzeIncompletionReasons(tasks) {
        const reasons = {};
        tasks.forEach((task) => {
            if (task.status !== task_enums_1.TaskStatus.COMPLETED) {
                const reason = this.determineIncompletionReason(task);
                reasons[reason] = (reasons[reason] || 0) + 1;
            }
        });
        return Object.entries(reasons)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count);
    }
    determineIncompletionReason(task) {
        if (task.status === task_enums_1.TaskStatus.OVERDUE)
            return 'Deadline Missed';
        if (task.status === task_enums_1.TaskStatus.CANCELLED)
            return 'Cancelled';
        if (task.status === task_enums_1.TaskStatus.MISSED) {
            if (!task.completionDate)
                return 'Never Started';
            if (task.progress < 50)
                return 'Insufficient Progress';
            return 'Incomplete Work';
        }
        return 'Other';
    }
    analyzeClientCompletionRates(tasks) {
        const clientStats = {};
        tasks.forEach((task) => {
            task.clients?.forEach((client) => {
                if (!clientStats[client.uid]) {
                    clientStats[client.uid] = {
                        totalTasks: 0,
                        completedTasks: 0,
                    };
                }
                clientStats[client.uid].totalTasks++;
                if (task.status === task_enums_1.TaskStatus.COMPLETED) {
                    clientStats[client.uid].completedTasks++;
                }
            });
        });
        return Object.entries(clientStats).map(([clientId, stats]) => ({
            clientId: parseInt(clientId),
            totalTasks: stats.totalTasks,
            completedTasks: stats.completedTasks,
            completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`,
        }));
    }
    analyzeTaskPriorityDistribution(tasks) {
        const distribution = Object.values(task_enums_1.TaskPriority).reduce((acc, priority) => {
            acc[priority] = 0;
            return acc;
        }, {});
        tasks.forEach((task) => {
            distribution[task.priority] = (distribution[task.priority] || 0) + 1;
        });
        return distribution;
    }
    analyzeAssigneePerformance(tasks) {
        const assigneeStats = {};
        tasks.forEach((task) => {
            task.assignees?.forEach((assignee) => {
                if (!assigneeStats[assignee.uid]) {
                    assigneeStats[assignee.uid] = {
                        totalTasks: 0,
                        completedTasks: 0,
                        totalCompletionTime: 0,
                    };
                }
                assigneeStats[assignee.uid].totalTasks++;
                if (task.status === task_enums_1.TaskStatus.COMPLETED && task.completionDate) {
                    assigneeStats[assignee.uid].completedTasks++;
                    assigneeStats[assignee.uid].totalCompletionTime +=
                        new Date(task.completionDate).getTime() - new Date(task.createdAt).getTime();
                }
            });
        });
        return Object.entries(assigneeStats).map(([assigneeId, stats]) => ({
            assigneeId: parseInt(assigneeId),
            totalTasks: stats.totalTasks,
            completedTasks: stats.completedTasks,
            completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`,
            averageCompletionTime: stats.completedTasks > 0
                ? `${Math.round(stats.totalCompletionTime / stats.completedTasks / (1000 * 60 * 60))} hours`
                : 'N/A',
        }));
    }
    async getClientNames(clientIds) {
        const clients = await this.clientRepository.find({
            where: { uid: (0, typeorm_3.In)(clientIds) },
            select: ['name'],
        });
        return clients.map((client) => ({ name: client.name }));
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_2.InjectRepository)(subtask_entity_1.SubTask)),
    __param(3, (0, typeorm_2.InjectRepository)(client_entity_1.Client)),
    __param(4, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(5, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        event_emitter_1.EventEmitter2,
        typeorm_1.Repository,
        typeorm_1.Repository, Object, config_1.ConfigService,
        communication_service_1.CommunicationService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map