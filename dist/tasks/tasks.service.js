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
const email_enums_1 = require("../lib/enums/email.enums");
const user_entity_1 = require("../user/entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
let TasksService = class TasksService {
    constructor(taskRepository, subtaskRepository, eventEmitter, clientRepository, userRepository, cacheManager, configService) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.eventEmitter = eventEmitter;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.CACHE_PREFIX = 'task:';
        this.CACHE_TTL = this.configService.get('CACHE_EXPIRATION_TIME') || 30;
    }
    getCacheKey(key, user) {
        const orgBranchKey = user ? `:org${user?.organisationRef}:branch${user?.branch?.uid}` : '';
        return `${this.CACHE_PREFIX}${key}${orgBranchKey}`;
    }
    async clearTaskCache(taskId, user) {
        if (taskId) {
            await this.cacheManager.del(this.getCacheKey(taskId, user));
        }
        await this.cacheManager.del(this.getCacheKey('all', user));
    }
    async createRepeatingTasks(baseTask, createTaskDto) {
        if (!createTaskDto.repetitionType || createTaskDto.repetitionType === task_enums_1.RepetitionType.NONE || !createTaskDto.deadline || !createTaskDto.repetitionEndDate) {
            return;
        }
        let currentDate = new Date(createTaskDto?.deadline);
        const endDate = new Date(createTaskDto?.repetitionEndDate);
        let tasksCreated = 0;
        const totalTasks = this.calculateTotalTasks(currentDate, endDate, createTaskDto?.repetitionType);
        while (currentDate < endDate) {
            let nextDate;
            switch (createTaskDto?.repetitionType) {
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
            const formattedDate = nextDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            repeatedTask.title = `${createTaskDto?.title} (${tasksCreated + 1}/${totalTasks}) - ${formattedDate}`;
            repeatedTask.description = `${createTaskDto?.description}\n\nRecurring ${createTaskDto?.repetitionType.toLowerCase()} task (Part ${tasksCreated + 1} of ${totalTasks})`;
            repeatedTask.deadline = nextDate;
            repeatedTask.assignees = baseTask?.assignees;
            repeatedTask.clients = baseTask?.clients;
            repeatedTask.status = task_enums_1.TaskStatus.PENDING;
            repeatedTask.taskType = createTaskDto?.taskType || task_enums_1.TaskType.OTHER;
            repeatedTask.priority = createTaskDto?.priority;
            repeatedTask.attachments = createTaskDto?.attachments;
            repeatedTask.lastCompletedAt = null;
            repeatedTask.repetitionType = task_enums_1.RepetitionType.NONE;
            repeatedTask.repetitionEndDate = null;
            repeatedTask.creator = baseTask?.creator;
            repeatedTask.targetCategory = createTaskDto?.targetCategory;
            await this.taskRepository.save(repeatedTask);
            currentDate = nextDate;
            tasksCreated++;
        }
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
    async create(createTaskDto, user) {
        try {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (createTaskDto?.deadline && new Date(createTaskDto?.deadline) < startOfToday) {
                throw new common_1.BadRequestException('Task deadline cannot be in the past');
            }
            if (createTaskDto?.repetitionEndDate && new Date(createTaskDto?.repetitionEndDate) < startOfToday) {
                throw new common_1.BadRequestException('Repetition end date cannot be in the past');
            }
            const taskData = {
                ...createTaskDto,
                organisation: user?.organisationRef ? { uid: user.organisationRef } : undefined,
                branch: user?.branch?.uid ? { uid: user.branch.uid } : undefined,
                creator: user?.uid ? { uid: user.uid } : undefined,
                status: task_enums_1.TaskStatus.PENDING,
                progress: 0,
                assignees: [],
                clients: [],
                attachments: createTaskDto?.attachments || []
            };
            if (createTaskDto?.assignees?.length > 0) {
                const assigneeUsers = [];
                for (const assignee of createTaskDto?.assignees) {
                    const user = await this.userRepository.findOne({
                        where: { uid: assignee?.uid }
                    });
                    if (user) {
                        assigneeUsers?.push(user);
                    }
                }
                taskData.assignees = assigneeUsers;
            }
            const clientUids = new Set();
            if (createTaskDto?.client?.uid) {
                clientUids.add(createTaskDto?.client?.uid);
            }
            if (createTaskDto?.targetCategory) {
                const categoryClients = await this.clientRepository.find({
                    where: {
                        category: createTaskDto?.targetCategory,
                        isDeleted: false
                    },
                    select: ['uid']
                });
                categoryClients.forEach(client => clientUids.add(client.uid));
            }
            if (clientUids.size > 0) {
                const clients = await this.clientRepository.findByIds(Array.from(clientUids));
                taskData.clients = clients;
            }
            const task = await this.taskRepository.save(taskData);
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (createTaskDto?.repetitionType !== task_enums_1.RepetitionType.NONE) {
                await this.createRepeatingTasks(task, createTaskDto);
            }
            if (createTaskDto?.subtasks?.length > 0) {
                const subtasks = createTaskDto?.subtasks?.map(subtask => ({
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
                const emailData = {
                    taskId: task?.uid?.toString(),
                    name: '',
                    title: task?.title,
                    description: task?.description,
                    deadline: task?.deadline ? new Date(task?.deadline).toLocaleDateString() : undefined,
                    priority: task?.priority,
                    taskType: task?.taskType,
                    status: task?.status,
                    assignedBy: task?.creator?.username || 'System',
                    subtasks: task?.subtasks?.map(subtask => ({
                        title: subtask?.title,
                        status: subtask?.status
                    })),
                    clients: task?.clients?.map(client => ({
                        name: client?.name,
                        category: client?.category
                    })),
                    attachments: task?.attachments?.map(attachment => {
                        const [name, url] = attachment.split('|');
                        return { name, url };
                    })
                };
                taskData.assignees.forEach(assignee => {
                    this.eventEmitter.emit('send.notification', {
                        ...notification,
                        owner: assignee,
                        metadata: {
                            taskId: task?.uid,
                            deadline: task?.deadline,
                            priority: task?.priority
                        }
                    }, [assignee.uid]);
                    if (assignee?.email) {
                        this.eventEmitter.emit('send.email', {
                            type: email_enums_1.EmailType.NEW_TASK,
                            recipient: assignee?.email,
                            data: {
                                ...emailData,
                                name: assignee?.username
                            }
                        });
                    }
                });
            }
            await this.clearTaskCache(undefined, user);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message);
        }
    }
    async findAll(filters, page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT), user) {
        try {
            const cacheKey = this.getCacheKey(`all:${page}:${limit}:${JSON.stringify(filters)}`, user);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const where = { isDeleted: false };
            const relations = ['creator', 'assignees', 'clients', 'subtasks', 'branch', 'organisation'];
            if (user?.organisationRef) {
                where.organisation = { uid: user.organisationRef };
            }
            if (user?.branch?.uid) {
                where.branch = { uid: user.branch.uid };
            }
            if (user?.role === 'user') {
                where.assignees = { uid: user.uid };
            }
            else if (user?.role === 'manager') {
                if (!user?.branch?.uid) {
                    throw new common_1.BadRequestException('Manager must be assigned to a branch');
                }
            }
            if (filters?.status)
                where.status = filters.status;
            if (filters?.priority)
                where.priority = filters.priority;
            if (filters?.isOverdue !== undefined)
                where.isOverdue = filters.isOverdue;
            if (filters?.startDate && filters?.endDate) {
                where.deadline = (0, typeorm_3.Between)(filters.startDate, filters.endDate);
            }
            if (filters?.assigneeId) {
                where.assignees = { ...where.assignees, uid: filters.assigneeId };
            }
            if (filters?.clientId) {
                where.clients = { uid: filters.clientId };
            }
            const [tasks, total] = await this.taskRepository.findAndCount({
                where,
                relations,
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            if (!tasks) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const result = {
                data: tasks,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
            return result;
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
    async findOne(ref, user) {
        try {
            const cacheKey = this.getCacheKey(ref, user);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return {
                    message: process.env.SUCCESS_MESSAGE,
                    task: cached
                };
            }
            const where = {
                uid: ref,
                isDeleted: false
            };
            if (user?.organisationRef) {
                where.organisation = { uid: user.organisationRef };
            }
            if (user?.branch?.uid) {
                where.branch = { uid: user.branch.uid };
            }
            const task = await this.taskRepository.findOne({
                where,
                relations: ['creator', 'assignees', 'clients', 'subtasks', 'branch', 'organisation']
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.set(cacheKey, task, this.CACHE_TTL);
            return {
                message: process.env.SUCCESS_MESSAGE,
                task
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
                where: { creator: { uid: ref }, isDeleted: false },
                relations: [
                    'createdBy',
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
    async update(ref, updateTaskDto, user) {
        try {
            const existingTask = await this.findOne(ref, user);
            if (!existingTask.task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (updateTaskDto?.assignees) {
                const assigneeUsers = await this.userRepository.findByIds(updateTaskDto?.assignees?.map(a => a?.uid));
                existingTask.task.assignees = assigneeUsers;
            }
            Object.assign(existingTask.task, {
                ...updateTaskDto,
                assignees: existingTask.task.assignees
            });
            const updatedTask = await this.taskRepository.save(existingTask.task);
            if (updatedTask.assignees?.length > 0) {
                const notification = {
                    type: notification_enums_1.NotificationType.USER,
                    title: 'Task Updated',
                    message: `Task has been updated: ${updatedTask.title}`,
                    status: notification_enums_1.NotificationStatus.UNREAD,
                    owner: null
                };
                const emailData = {
                    taskId: updatedTask.uid.toString(),
                    name: '',
                    title: updatedTask.title,
                    description: updatedTask.description,
                    deadline: updatedTask.deadline ? new Date(updatedTask.deadline).toLocaleDateString() : undefined,
                    priority: updatedTask.priority,
                    taskType: updatedTask.taskType,
                    status: updatedTask.status,
                    assignedBy: updatedTask.creator?.username || 'System',
                    subtasks: updatedTask.subtasks?.map(subtask => ({
                        title: subtask.title,
                        status: subtask.status
                    })),
                    clients: updatedTask.clients?.map(client => ({
                        name: client.name,
                        category: client.category
                    })),
                    attachments: updatedTask.attachments?.map(attachment => {
                        const [name, url] = attachment.split('|');
                        return { name, url };
                    })
                };
                updatedTask.assignees.forEach(assignee => {
                    this.eventEmitter.emit('send.notification', {
                        ...notification,
                        owner: assignee,
                        metadata: {
                            taskId: updatedTask?.uid,
                            deadline: updatedTask?.deadline,
                            priority: updatedTask?.priority
                        }
                    }, [assignee.uid]);
                    if (assignee.email) {
                        this.eventEmitter.emit('send.email', {
                            type: email_enums_1.EmailType.TASK_UPDATED,
                            recipient: assignee?.email,
                            data: {
                                ...emailData,
                                name: assignee?.username
                            }
                        });
                    }
                });
            }
            await this.clearTaskCache(ref, user);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message);
        }
    }
    async remove(ref, user) {
        try {
            const existingTask = await this.findOne(ref, user);
            if (!existingTask.task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.taskRepository.update({ uid: ref }, { isDeleted: true });
            await this.clearTaskCache(ref, user);
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
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
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
                    task.creator.uid,
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
    async getTasksReport(filter) {
        try {
            const tasks = await this.taskRepository.find({
                where: {
                    ...filter,
                    isDeleted: false
                },
                relations: ['assignees', 'clients', 'subtasks', 'createdBy']
            });
            if (!tasks) {
                throw new common_1.NotFoundException('No tasks found for the specified period');
            }
            const groupedTasks = {
                pending: tasks.filter(task => task.status === task_enums_1.TaskStatus.PENDING),
                inProgress: tasks.filter(task => task.status === task_enums_1.TaskStatus.IN_PROGRESS),
                completed: tasks.filter(task => task.status === task_enums_1.TaskStatus.COMPLETED),
                overdue: tasks.filter(task => task.status === task_enums_1.TaskStatus.OVERDUE)
            };
            const totalTasks = tasks.length;
            const completedTasks = groupedTasks.completed.length;
            const avgCompletionTime = this.calculateAverageCompletionTime(tasks);
            const overdueRate = this.calculateOverdueRate(tasks);
            const taskDistribution = this.analyzeTaskDistribution(tasks);
            const incompletionReasons = this.analyzeIncompletionReasons(tasks);
            const clientCompletionRates = this.analyzeClientCompletionRates(tasks);
            const taskPriorityDistribution = this.analyzeTaskPriorityDistribution(tasks);
            const assigneePerformance = this.analyzeAssigneePerformance(tasks);
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
                    assigneePerformance
                }
            };
        }
        catch (error) {
            return null;
        }
    }
    calculateAverageCompletionTime(tasks) {
        const completedTasks = tasks.filter(task => task.status === task_enums_1.TaskStatus.COMPLETED &&
            task.lastCompletedAt);
        if (completedTasks.length === 0)
            return 0;
        const totalCompletionTime = completedTasks.reduce((sum, task) => {
            const completionTime = task.lastCompletedAt.getTime() - task.createdAt.getTime();
            return sum + completionTime;
        }, 0);
        return Number((totalCompletionTime / (completedTasks.length * 60 * 60 * 1000)).toFixed(1));
    }
    calculateOverdueRate(tasks) {
        if (tasks.length === 0)
            return 0;
        const overdueTasks = tasks.filter(task => task.isOverdue || task.status === task_enums_1.TaskStatus.OVERDUE).length;
        return Number(((overdueTasks / tasks.length) * 100).toFixed(1));
    }
    analyzeTaskDistribution(tasks) {
        const distribution = Object.values(task_enums_1.TaskType).reduce((acc, type) => {
            acc[type] = 0;
            return acc;
        }, {});
        tasks.forEach(task => {
            if (task.taskType) {
                distribution[task.taskType]++;
            }
        });
        return distribution;
    }
    analyzeIncompletionReasons(tasks) {
        const incompleteTasks = tasks.filter(task => task.status === task_enums_1.TaskStatus.CANCELLED ||
            task.status === task_enums_1.TaskStatus.MISSED ||
            task.status === task_enums_1.TaskStatus.OVERDUE);
        const reasons = incompleteTasks.reduce((acc, task) => {
            const reason = this.determineIncompletionReason(task);
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});
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
            if (!task.lastCompletedAt)
                return 'Never Started';
            if (task.progress < 50)
                return 'Insufficient Progress';
            return 'Incomplete Work';
        }
        return 'Other';
    }
    analyzeClientCompletionRates(tasks) {
        const clientTasks = new Map();
        tasks.forEach(task => {
            task.clients?.forEach(client => {
                if (!clientTasks.has(client.uid)) {
                    clientTasks.set(client.uid, {
                        clientName: client.name,
                        total: 0,
                        completed: 0
                    });
                }
                const stats = clientTasks.get(client.uid);
                stats.total++;
                if (task.status === task_enums_1.TaskStatus.COMPLETED) {
                    stats.completed++;
                }
            });
        });
        return Array.from(clientTasks.entries())
            .map(([clientId, stats]) => ({
            clientId,
            clientName: stats.clientName,
            totalTasks: stats.total,
            completedTasks: stats.completed,
            completionRate: `${((stats.completed / stats.total) * 100).toFixed(1)}%`
        }))
            .sort((a, b) => (b.completedTasks / b.totalTasks) - (a.completedTasks / a.totalTasks));
    }
    analyzeTaskPriorityDistribution(tasks) {
        return tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
    }
    analyzeAssigneePerformance(tasks) {
        const assigneeStats = new Map();
        tasks.forEach(task => {
            task.assignees?.forEach(assignee => {
                if (!assigneeStats.has(assignee.uid)) {
                    assigneeStats.set(assignee.uid, {
                        name: assignee.username,
                        total: 0,
                        completed: 0,
                        totalCompletionTime: 0
                    });
                }
                const stats = assigneeStats.get(assignee.uid);
                stats.total++;
                if (task.status === task_enums_1.TaskStatus.COMPLETED && task.lastCompletedAt) {
                    stats.completed++;
                    stats.totalCompletionTime +=
                        task.lastCompletedAt.getTime() - task.createdAt.getTime();
                }
            });
        });
        return Array.from(assigneeStats.entries())
            .map(([assigneeId, stats]) => ({
            assigneeId,
            assigneeName: stats.name,
            totalTasks: stats.total,
            completedTasks: stats.completed,
            completionRate: `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
            averageCompletionTime: `${(stats.completed > 0
                ? (stats.totalCompletionTime / (stats.completed * 60 * 60 * 1000))
                : 0).toFixed(1)} hours`
        }))
            .sort((a, b) => (b.completedTasks / b.totalTasks) - (a.completedTasks / a.totalTasks));
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
        typeorm_1.Repository, Object, config_1.ConfigService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map