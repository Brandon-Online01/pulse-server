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
var TasksService_1;
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
let TasksService = TasksService_1 = class TasksService {
    constructor(taskRepository, subtaskRepository, eventEmitter, clientRepository, userRepository, cacheManager, configService) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.eventEmitter = eventEmitter;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.CACHE_PREFIX = 'task:';
        this.logger = new common_1.Logger(TasksService_1.name);
        this.CACHE_TTL = this.configService.get('CACHE_EXPIRATION_TIME') || 30;
    }
    getCacheKey(key) {
        return `${this.CACHE_PREFIX}${key}`;
    }
    async clearTaskCache(taskId) {
        try {
            if (taskId) {
                await this.cacheManager.del(this.getCacheKey(taskId));
            }
            await this.cacheManager.del(this.getCacheKey('all'));
        }
        catch (error) {
            this.logger.error('Error clearing cache:', error);
        }
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
            await this.clearTaskCache();
            return {
                message: process.env.SUCCESS_MESSAGE
            };
        }
        catch (error) {
            return {
                message: error?.message
            };
        }
    }
    async findAll(filters, page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const cacheKey = this.getCacheKey('all');
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
                relations: ['subtasks', 'creator',],
                skip: (page - 1) * limit,
                take: limit,
                order: {
                    createdAt: 'DESC'
                }
            });
            let filteredTasks = tasks;
            if (filters?.assigneeId) {
                filteredTasks = filteredTasks?.filter(task => task.assignees?.some(assignee => assignee?.uid === filters?.assigneeId));
            }
            if (filters?.clientId) {
                filteredTasks = filteredTasks?.filter(task => task.clients?.some(client => client?.uid === filters?.clientId));
            }
            const response = {
                data: filteredTasks,
                meta: {
                    total: filteredTasks?.length,
                    page,
                    limit,
                    totalPages: Math.ceil(filteredTasks?.length / limit),
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
    async findOne(ref) {
        try {
            const cacheKey = this.getCacheKey(ref);
            const cachedTask = await this.cacheManager.get(cacheKey);
            if (cachedTask) {
                return {
                    task: cachedTask,
                    message: process.env.SUCCESS_MESSAGE
                };
            }
            const task = await this.taskRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false
                },
                relations: ['assignees', 'clients', 'creator', 'subtasks']
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.set(cacheKey, task, this.CACHE_TTL);
            return {
                task,
                message: process.env.SUCCESS_MESSAGE
            };
        }
        catch (error) {
            return {
                task: null,
                message: error?.message
            };
        }
    }
    async tasksByUser(ref) {
        try {
            const tasks = await this.taskRepository.find({
                where: { creator: { uid: ref }, isDeleted: false },
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
                where: {
                    uid: ref,
                    isDeleted: false
                }
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            if (updateTaskDto?.assignees?.length > 0) {
                const assigneeUsers = [];
                for (const assignee of updateTaskDto?.assignees) {
                    const user = await this.userRepository.findOne({
                        where: { uid: assignee?.uid }
                    });
                    if (user) {
                        assigneeUsers?.push(user);
                    }
                }
                updateTaskDto.assignees = assigneeUsers;
            }
            if (updateTaskDto?.clients?.length > 0) {
                const clients = await this.clientRepository.findByIds(updateTaskDto.clients.map(client => client.uid));
                updateTaskDto.clients = clients;
            }
            await this.taskRepository.save({
                ...task,
                ...updateTaskDto
            });
            await this.clearTaskCache(ref);
            return {
                message: process.env.SUCCESS_MESSAGE
            };
        }
        catch (error) {
            return {
                message: error?.message
            };
        }
    }
    async remove(ref) {
        try {
            const task = await this.taskRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false
                }
            });
            if (!task) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.taskRepository.update(ref, { isDeleted: true });
            await this.clearTaskCache(ref);
            return {
                message: process.env.SUCCESS_MESSAGE
            };
        }
        catch (error) {
            return {
                message: error?.message
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
            distribution[task.taskType] = (distribution[task.taskType] || 0) + 1;
        });
        return distribution;
    }
    analyzeIncompletionReasons(tasks) {
        const reasons = {};
        tasks.forEach(task => {
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
            if (!task.lastCompletedAt)
                return 'Never Started';
            if (task.progress < 50)
                return 'Insufficient Progress';
            return 'Incomplete Work';
        }
        return 'Other';
    }
    analyzeClientCompletionRates(tasks) {
        const clientStats = {};
        tasks.forEach(task => {
            task.clients?.forEach(client => {
                if (!clientStats[client.uid]) {
                    clientStats[client.uid] = {
                        clientName: client.name,
                        totalTasks: 0,
                        completedTasks: 0
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
            clientName: stats.clientName,
            totalTasks: stats.totalTasks,
            completedTasks: stats.completedTasks,
            completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`
        }));
    }
    analyzeTaskPriorityDistribution(tasks) {
        const distribution = Object.values(task_enums_1.TaskPriority).reduce((acc, priority) => {
            acc[priority] = 0;
            return acc;
        }, {});
        tasks.forEach(task => {
            distribution[task.priority] = (distribution[task.priority] || 0) + 1;
        });
        return distribution;
    }
    analyzeAssigneePerformance(tasks) {
        const assigneeStats = {};
        tasks.forEach(task => {
            task.assignees?.forEach(assignee => {
                if (!assigneeStats[assignee.uid]) {
                    assigneeStats[assignee.uid] = {
                        assigneeName: assignee.username,
                        totalTasks: 0,
                        completedTasks: 0,
                        totalCompletionTime: 0
                    };
                }
                assigneeStats[assignee.uid].totalTasks++;
                if (task.status === task_enums_1.TaskStatus.COMPLETED && task.lastCompletedAt) {
                    assigneeStats[assignee.uid].completedTasks++;
                    assigneeStats[assignee.uid].totalCompletionTime +=
                        new Date(task.lastCompletedAt).getTime() - new Date(task.createdAt).getTime();
                }
            });
        });
        return Object.entries(assigneeStats).map(([assigneeId, stats]) => ({
            assigneeId: parseInt(assigneeId),
            assigneeName: stats.assigneeName,
            totalTasks: stats.totalTasks,
            completedTasks: stats.completedTasks,
            completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`,
            averageCompletionTime: stats.completedTasks > 0
                ? `${Math.round(stats.totalCompletionTime / stats.completedTasks / (1000 * 60 * 60))} hours`
                : 'N/A'
        }));
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
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