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
const common_1 = require("@nestjs/common");
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
let TasksController = class TasksController {
    constructor(tasksService, taskRouteService) {
        this.tasksService = tasksService;
        this.taskRouteService = taskRouteService;
    }
    create(createTaskDto) {
        return this.tasksService.create(createTaskDto);
    }
    findAll(status, priority, assigneeId, clientId, startDate, endDate, isOverdue, page, limit) {
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
            return this.tasksService.findAll(Object.keys(filters).length > 0 ? filters : undefined, pageNum, limitNum);
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page: parseInt(page, 10) || 1,
                    limit: parseInt(limit, 10) || Number(process.env.DEFAULT_PAGE_LIMIT),
                    totalPages: 0,
                },
                message: error?.message || 'An error occurred while fetching tasks',
            };
        }
    }
    findOne(ref) {
        return this.tasksService.findOne(ref);
    }
    tasksByUser(ref) {
        return this.tasksService.tasksByUser(ref);
    }
    findOneSubTask(ref) {
        return this.tasksService.findOneSubTask(ref);
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
    async getOptimizedRoutes(dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        const routes = await this.taskRouteService.planRoutes(date);
        return routes.map(route => ({
            userId: route.assignee.uid,
            stops: route.waypoints.map(wp => ({
                taskId: wp.taskId,
                clientId: wp.clientId,
                location: {
                    latitude: wp.location.lat,
                    longitude: wp.location.lng,
                    address: ''
                }
            })),
            estimatedDuration: route.totalDuration,
            totalDistance: route.totalDistance
        }));
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'create a new task' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get all tasks' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, common_1.Query)('assigneeId')),
    __param(3, (0, common_1.Query)('clientId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('isOverdue')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get a task by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get tasks by user reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "tasksByUser", null);
__decorate([
    (0, common_1.Get)('sub-task/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get a subtask by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOneSubTask", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'update a task by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('sub-task/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'update a subtask by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_subtask_dto_1.UpdateSubtaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateSubTask", null);
__decorate([
    (0, common_1.Patch)('sub-task/complete/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'complete a subtask by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "completeSubTask", null);
__decorate([
    (0, common_1.Delete)('sub-task/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'soft delete a subtask by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "deleteSubTask", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'soft delete a task by reference' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('routes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get optimized routes for tasks' }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getOptimizedRoutes", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        task_route_service_1.TaskRouteService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map