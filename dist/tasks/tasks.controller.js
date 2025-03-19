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
exports.TasksController = void 0;
const tasks_service_1 = require("./tasks.service");
const task_route_service_1 = require("./task-route.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const update_subtask_dto_1 = require("./dto/update-subtask.dto");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
const task_enums_1 = require("../lib/enums/task.enums");
const common_1 = require("@nestjs/common");
const create_task_flag_dto_1 = require("./dto/create-task-flag.dto");
const update_task_flag_dto_1 = require("./dto/update-task-flag.dto");
const update_task_flag_item_dto_1 = require("./dto/update-task-flag-item.dto");
const add_comment_dto_1 = require("./dto/add-comment.dto");
const task_enums_2 = require("../lib/enums/task.enums");
let TasksController = class TasksController {
    constructor(tasksService, taskRouteService) {
        this.tasksService = tasksService;
        this.taskRouteService = taskRouteService;
    }
    create(createTaskDto) {
        return this.tasksService.create(createTaskDto);
    }
    findAll(status, priority, assigneeId, clientId, startDate, endDate, isOverdue, page, limit, req) {
        try {
            const pageNum = page ? parseInt(page, 10) : 1;
            const limitNum = limit ? parseInt(limit, 10) : Number(process.env.DEFAULT_PAGE_LIMIT);
            const filters = {};
            if (status && status !== 'undefined' && status !== '') {
                filters.status = status;
            }
            if (priority && priority !== 'undefined' && priority !== '') {
                filters.priority = priority;
            }
            if (assigneeId && assigneeId !== 'undefined' && assigneeId !== '') {
                const id = parseInt(assigneeId, 10);
                if (!isNaN(id)) {
                    filters.assigneeId = id;
                }
            }
            if (clientId && clientId !== 'undefined' && clientId !== '') {
                const id = parseInt(clientId, 10);
                if (!isNaN(id)) {
                    filters.clientId = id;
                }
            }
            if (startDate && startDate !== 'undefined' && startDate !== '') {
                const date = new Date(startDate);
                if (!isNaN(date.getTime())) {
                    filters.startDate = date;
                }
            }
            if (endDate && endDate !== 'undefined' && endDate !== '') {
                const date = new Date(endDate);
                if (!isNaN(date.getTime())) {
                    filters.endDate = date;
                }
            }
            if (isOverdue && isOverdue !== 'undefined' && isOverdue !== '') {
                filters.isOverdue = isOverdue.toLowerCase() === 'true';
            }
            if (req?.user?.organisationRef) {
                filters.organisationRef = req.user.organisationRef;
            }
            if (req?.user?.branch?.uid) {
                filters.branchId = req.user.branch.uid;
            }
            return this.tasksService.findAll(Object.keys(filters).length > 0 ? filters : undefined, pageNum, limitNum);
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page: parseInt(page, 20) || 1,
                    limit: parseInt(limit, 20) || Number(process.env.DEFAULT_PAGE_LIMIT),
                    totalPages: 0,
                },
                message: error?.message || 'An error occurred while fetching tasks',
            };
        }
    }
    findOne(ref, req) {
        const organisationRef = req?.user?.organisationRef;
        const branchId = req?.user?.branch?.uid;
        return this.tasksService.findOne(ref, organisationRef, branchId);
    }
    tasksByUser(ref, req) {
        const organisationRef = req?.user?.organisationRef;
        const branchId = req?.user?.branch?.uid;
        return this.tasksService.tasksByUser(ref, organisationRef, branchId);
    }
    findOneSubTask(ref, req) {
        const organisationRef = req?.user?.organisationRef;
        const branchId = req?.user?.branch?.uid;
        return this.tasksService.findOneSubTask(ref, organisationRef, branchId);
    }
    update(ref, updateTaskDto) {
        return this.tasksService.update(ref, updateTaskDto);
    }
    updateSubTask(ref, updateSubTaskDto) {
        return this.tasksService.updateSubTask(ref, updateSubTaskDto);
    }
    completeSubTask(ref) {
        return this.tasksService.completeSubTask(ref);
    }
    deleteSubTask(ref) {
        return this.tasksService.deleteSubTask(ref);
    }
    remove(ref) {
        return this.tasksService.remove(ref);
    }
    async getOptimizedRoutes(dateStr, req) {
        const date = dateStr ? new Date(dateStr) : new Date();
        const organisationRef = req?.user?.organisationRef;
        const branchId = req?.user?.branch?.uid;
        const routes = await this.taskRouteService.getRoutes(date, organisationRef, branchId);
        return routes.map((route) => ({
            userId: route.assignee.uid,
            stops: route.waypoints.map((wp) => ({
                taskId: wp.taskId,
                clientId: wp.clientId,
                location: {
                    latitude: wp.location.lat,
                    longitude: wp.location.lng,
                    address: '',
                },
            })),
            estimatedDuration: route.totalDuration,
            totalDistance: route.totalDistance,
        }));
    }
    async calculateOptimizedRoutes(dateStr, req) {
        const date = dateStr ? new Date(dateStr) : new Date();
        const organisationRef = req?.user?.organisationRef;
        const branchId = req?.user?.branch?.uid;
        await this.taskRouteService.planRoutes(date, organisationRef, branchId);
        return { message: 'Routes calculated successfully' };
    }
    toggleJobStatus(id) {
        return this.tasksService.toggleJobStatus(+id);
    }
    createTaskFlag(createTaskFlagDto, req) {
        return this.tasksService.createTaskFlag(createTaskFlagDto, req.user.uid);
    }
    addComment(flagId, commentDto, req) {
        return this.tasksService.addComment(flagId, commentDto, req.user.uid);
    }
    getTaskFlags(taskId, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.tasksService.getTaskFlags(taskId, pageNum, limitNum);
    }
    getTaskFlag(flagId) {
        return this.tasksService.getTaskFlag(flagId);
    }
    updateTaskFlag(flagId, updateTaskFlagDto) {
        return this.tasksService.updateTaskFlag(flagId, updateTaskFlagDto);
    }
    updateTaskFlagItem(itemId, updateTaskFlagItemDto) {
        return this.tasksService.updateTaskFlagItem(itemId, updateTaskFlagItemDto);
    }
    deleteTaskFlag(flagId) {
        return this.tasksService.deleteTaskFlag(flagId);
    }
    getTaskFlagReports(status, startDate, endDate, deadlineBefore, deadlineAfter, userId, page, limit, req) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const filters = {};
        if (status)
            filters.status = status;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (deadlineBefore)
            filters.deadlineBefore = new Date(deadlineBefore);
        if (deadlineAfter)
            filters.deadlineAfter = new Date(deadlineAfter);
        if (userId)
            filters.userId = userId;
        if (req?.user?.organisationRef) {
            filters.organisationRef = req.user.organisationRef;
        }
        if (req?.user?.branch?.uid) {
            filters.branchId = req.user.branch.uid;
        }
        return this.tasksService.getTaskFlagReports(filters, pageNum, limitNum);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new task',
        description: 'Creates a new task with the provided details including assignees, clients, and subtasks',
    }),
    (0, swagger_1.ApiBody)({ type: create_task_dto_1.CreateTaskDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Task created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating task' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all tasks',
        description: 'Retrieves a paginated list of all tasks with optional filtering by status, priority, assignee, client, date range, and overdue status',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: task_enums_1.TaskStatus, required: false, description: 'Filter by task status' }),
    (0, swagger_1.ApiQuery)({ name: 'priority', enum: task_enums_1.TaskPriority, required: false, description: 'Filter by task priority' }),
    (0, swagger_1.ApiQuery)({ name: 'assigneeId', type: String, required: false, description: 'Filter by assignee ID' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', type: String, required: false, description: 'Filter by client ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: String, required: false, description: 'Filter by start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: String, required: false, description: 'Filter by end date (ISO format)' }),
    (0, swagger_1.ApiQuery)({
        name: 'isOverdue',
        type: String,
        required: false,
        description: 'Filter by overdue status (true/false)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of records per page, defaults to system setting',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of tasks retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            status: { type: 'string', enum: Object.values(task_enums_1.TaskStatus) },
                            priority: { type: 'string', enum: Object.values(task_enums_1.TaskPriority) },
                            deadline: { type: 'string', format: 'date-time' },
                            progress: { type: 'number' },
                            isOverdue: { type: 'boolean' },
                        },
                    },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 10 },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, common_1.Query)('assigneeId')),
    __param(3, (0, common_1.Query)('clientId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('isOverdue')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __param(9, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a task by reference',
        description: 'Retrieves detailed information about a specific task including assignees, clients, and subtasks',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Task reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Task details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                task: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: { type: 'string', enum: Object.values(task_enums_1.TaskStatus) },
                        priority: { type: 'string', enum: Object.values(task_enums_1.TaskPriority) },
                        deadline: { type: 'string', format: 'date-time' },
                        progress: { type: 'number' },
                        isOverdue: { type: 'boolean' },
                        assignees: { type: 'array', items: { type: 'object' } },
                        clients: { type: 'array', items: { type: 'object' } },
                        subtasks: { type: 'array', items: { type: 'object' } },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Task not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Task not found' },
                task: { type: 'null' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tasks by user reference code',
        description: 'Retrieves all tasks assigned to a specific user',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'User reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User tasks retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                tasks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            status: { type: 'string' },
                            priority: { type: 'string' },
                            deadline: { type: 'string', format: 'date-time' },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found or has no tasks',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'No tasks found for this user' },
                tasks: { type: 'array', items: {}, example: [] },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "tasksByUser", null);
__decorate([
    (0, common_1.Get)('sub-task/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a subtask by reference',
        description: 'Retrieves detailed information about a specific subtask',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Subtask details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                subtask: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: { type: 'string' },
                        isCompleted: { type: 'boolean' },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Subtask not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Subtask not found' },
                subtask: { type: 'null' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOneSubTask", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a task by reference',
        description: 'Updates an existing task with the provided information including status, assignees, clients, and subtasks',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Task reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_task_dto_1.UpdateTaskDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Task updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Task not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Task not found' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating task' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('sub-task/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a subtask by reference',
        description: 'Updates an existing subtask with the provided information',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_subtask_dto_1.UpdateSubtaskDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Subtask updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Subtask not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Subtask not found' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating subtask' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_subtask_dto_1.UpdateSubtaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateSubTask", null);
__decorate([
    (0, common_1.Patch)('sub-task/complete/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete a subtask by reference',
        description: 'Marks a subtask as completed',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Subtask completed successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Subtask not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Subtask not found' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "completeSubTask", null);
__decorate([
    (0, common_1.Delete)('sub-task/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a subtask by reference',
        description: 'Marks a subtask as deleted without removing it from the database',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Subtask deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Subtask not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Subtask not found' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "deleteSubTask", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a task by reference',
        description: 'Marks a task as deleted without removing it from the database',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Task reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Task deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Task not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error deleting task' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('routes'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get optimized routes for tasks',
        description: 'Retrieves optimized routes for tasks on a specific date',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        type: String,
        required: false,
        description: 'Date for which to retrieve routes (ISO format), defaults to current date',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Routes retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'number' },
                    stops: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                taskId: { type: 'number' },
                                clientId: { type: 'number' },
                                location: {
                                    type: 'object',
                                    properties: {
                                        latitude: { type: 'number' },
                                        longitude: { type: 'number' },
                                        address: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    estimatedDuration: { type: 'number' },
                    totalDistance: { type: 'number' },
                },
            },
        },
    }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getOptimizedRoutes", null);
__decorate([
    (0, common_1.Post)('routes/calculate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Calculate optimized routes for tasks on a specific date',
        description: 'Calculates and stores optimized routes for tasks on a specific date',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        type: String,
        required: false,
        description: 'Date for which to calculate routes (ISO format), defaults to current date',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Routes calculated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Routes calculated successfully' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid date or no tasks found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error calculating routes' },
            },
        },
    }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "calculateOptimizedRoutes", null);
__decorate([
    (0, common_1.Patch)('toggle-job-status/:id'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Toggle job status',
        description: 'Toggles job status between QUEUED, RUNNING, and COMPLETED. Updates start/end times and calculates duration.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Job status toggled successfully',
        schema: {
            type: 'object',
            properties: {
                task: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        title: { type: 'string' },
                        status: { type: 'string' },
                        jobStatus: { type: 'string' },
                        jobStartTime: { type: 'string', format: 'date-time' },
                        jobEndTime: { type: 'string', format: 'date-time' },
                        jobDuration: { type: 'number' }
                    }
                },
                message: { type: 'string', example: 'Job status updated successfully' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Task not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Task not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "toggleJobStatus", null);
__decorate([
    (0, common_1.Post)('flags'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Flag a completed task',
        description: 'Creates a new flag for a completed task with a checklist of issues that need to be addressed',
    }),
    (0, swagger_1.ApiBody)({ type: create_task_flag_dto_1.CreateTaskFlagDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Task flag created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Task flag created successfully' },
                flagId: { type: 'number', example: 123 },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating task flag' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_flag_dto_1.CreateTaskFlagDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "createTaskFlag", null);
__decorate([
    (0, common_1.Post)('flags/:flagId/comments'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Add a comment to a task flag',
        description: 'Adds a new comment to an existing task flag',
    }),
    (0, swagger_1.ApiParam)({ name: 'flagId', description: 'Task flag ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: add_comment_dto_1.AddCommentDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Comment added successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Comment added successfully' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('flagId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, add_comment_dto_1.AddCommentDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/flags'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get flags for a specific task',
        description: 'Retrieves all flags created for a specific task',
    }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ID', type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of records per page, defaults to 10',
    }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getTaskFlags", null);
__decorate([
    (0, common_1.Get)('flags/:flagId'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific task flag',
        description: 'Retrieves detailed information about a specific task flag',
    }),
    (0, swagger_1.ApiParam)({ name: 'flagId', description: 'Flag ID', type: 'number' }),
    __param(0, (0, common_1.Param)('flagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getTaskFlag", null);
__decorate([
    (0, common_1.Patch)('flags/:flagId'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a task flag',
        description: 'Updates the details of an existing task flag',
    }),
    (0, swagger_1.ApiParam)({ name: 'flagId', description: 'Flag ID', type: 'number' }),
    __param(0, (0, common_1.Param)('flagId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_flag_dto_1.UpdateTaskFlagDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateTaskFlag", null);
__decorate([
    (0, common_1.Patch)('flag-items/:itemId'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a task flag checklist item',
        description: 'Updates the status or details of a task flag checklist item',
    }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Flag Item ID', type: 'number' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_flag_item_dto_1.UpdateTaskFlagItemDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateTaskFlagItem", null);
__decorate([
    (0, common_1.Delete)('flags/:flagId'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a task flag',
        description: 'Soft deletes a task flag',
    }),
    (0, swagger_1.ApiParam)({ name: 'flagId', description: 'Flag ID', type: 'number' }),
    __param(0, (0, common_1.Param)('flagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "deleteTaskFlag", null);
__decorate([
    (0, common_1.Get)('flags/reports'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get task flag reports',
        description: 'Retrieves reports on task flags with filtering options',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: task_enums_2.TaskFlagStatus, required: false, description: 'Filter by flag status' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: String, required: false, description: 'Filter by start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: String, required: false, description: 'Filter by end date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'deadlineBefore', type: String, required: false, description: 'Filter by deadline before date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'deadlineAfter', type: String, required: false, description: 'Filter by deadline after date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', type: Number, required: false, description: 'Filter by user who created the flag' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of records per page, defaults to 10',
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('deadlineBefore')),
    __param(4, (0, common_1.Query)('deadlineAfter')),
    __param(5, (0, common_1.Query)('userId')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __param(8, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getTaskFlagReports", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('tasks'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [tasks_service_1.TasksService, task_route_service_1.TaskRouteService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map