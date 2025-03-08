import { TasksService } from './tasks.service';
import { TaskRouteService } from './task-route.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
	ApiOperation,
	ApiTags,
	ApiParam,
	ApiBody,
	ApiOkResponse,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiUnauthorizedResponse,
	ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { TaskStatus, TaskPriority } from '../lib/enums/task.enums';
import { OptimizedRoute } from './interfaces/route.interface';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('tasks')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class TasksController {
	constructor(private readonly tasksService: TasksService, private readonly taskRouteService: TaskRouteService) {}

	@Post()
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Create a new task',
		description: 'Creates a new task with the provided details including assignees, clients, and subtasks',
	})
	@ApiBody({ type: CreateTaskDto })
	@ApiCreatedResponse({
		description: 'Task created successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error creating task' },
			},
		},
	})
	create(@Body() createTaskDto: CreateTaskDto) {
		return this.tasksService.create(createTaskDto);
	}

	@Get()
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Get all tasks',
		description:
			'Retrieves a paginated list of all tasks with optional filtering by status, priority, assignee, client, date range, and overdue status',
	})
	@ApiQuery({ name: 'status', enum: TaskStatus, required: false, description: 'Filter by task status' })
	@ApiQuery({ name: 'priority', enum: TaskPriority, required: false, description: 'Filter by task priority' })
	@ApiQuery({ name: 'assigneeId', type: String, required: false, description: 'Filter by assignee ID' })
	@ApiQuery({ name: 'clientId', type: String, required: false, description: 'Filter by client ID' })
	@ApiQuery({ name: 'startDate', type: String, required: false, description: 'Filter by start date (ISO format)' })
	@ApiQuery({ name: 'endDate', type: String, required: false, description: 'Filter by end date (ISO format)' })
	@ApiQuery({
		name: 'isOverdue',
		type: String,
		required: false,
		description: 'Filter by overdue status (true/false)',
	})
	@ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' })
	@ApiQuery({
		name: 'limit',
		type: Number,
		required: false,
		description: 'Number of records per page, defaults to system setting',
	})
	@ApiOkResponse({
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
							status: { type: 'string', enum: Object.values(TaskStatus) },
							priority: { type: 'string', enum: Object.values(TaskPriority) },
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
	})
	findAll(
		@Query('status') status?: string,
		@Query('priority') priority?: string,
		@Query('assigneeId') assigneeId?: string,
		@Query('clientId') clientId?: string,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string,
		@Query('isOverdue') isOverdue?: string,
		@Query('page') page?: string,
		@Query('limit') limit?: string,
	) {
		try {
			// Convert page and limit to numbers first
			const pageNum = page ? parseInt(page, 10) : 1;
			const limitNum = limit ? parseInt(limit, 10) : Number(process.env.DEFAULT_PAGE_LIMIT);

			// Initialize filters object only if we have valid filters
			const filters: Record<string, any> = {};

			// Only add filters if they are actually provided and valid
			if (status && status !== 'undefined' && status !== '') {
				filters.status = status as TaskStatus;
			}
			if (priority && priority !== 'undefined' && priority !== '') {
				filters.priority = priority as TaskPriority;
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

			// Call service with filters only if we have any
			return this.tasksService.findAll(Object.keys(filters).length > 0 ? filters : undefined, pageNum, limitNum);
		} catch (error) {
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

	@Get(':ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Get a task by reference',
		description: 'Retrieves detailed information about a specific task including assignees, clients, and subtasks',
	})
	@ApiParam({ name: 'ref', description: 'Task reference code or ID', type: 'number' })
	@ApiOkResponse({
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
						status: { type: 'string', enum: Object.values(TaskStatus) },
						priority: { type: 'string', enum: Object.values(TaskPriority) },
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
	})
	@ApiNotFoundResponse({
		description: 'Task not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Task not found' },
				task: { type: 'null' },
			},
		},
	})
	findOne(@Param('ref') ref: number) {
		return this.tasksService.findOne(ref);
	}

	@Get('for/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Get tasks by user reference code',
		description: 'Retrieves all tasks assigned to a specific user',
	})
	@ApiParam({ name: 'ref', description: 'User reference code or ID', type: 'number' })
	@ApiOkResponse({
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
	})
	@ApiNotFoundResponse({
		description: 'User not found or has no tasks',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'No tasks found for this user' },
				tasks: { type: 'array', items: {}, example: [] },
			},
		},
	})
	tasksByUser(@Param('ref') ref: number) {
		return this.tasksService.tasksByUser(ref);
	}

	@Get('sub-task/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Get a subtask by reference',
		description: 'Retrieves detailed information about a specific subtask',
	})
	@ApiParam({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' })
	@ApiOkResponse({
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
	})
	@ApiNotFoundResponse({
		description: 'Subtask not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Subtask not found' },
				subtask: { type: 'null' },
			},
		},
	})
	findOneSubTask(@Param('ref') ref: number) {
		return this.tasksService.findOneSubTask(ref);
	}

	@Patch(':ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Update a task by reference',
		description:
			'Updates an existing task with the provided information including status, assignees, clients, and subtasks',
	})
	@ApiParam({ name: 'ref', description: 'Task reference code or ID', type: 'number' })
	@ApiBody({ type: UpdateTaskDto })
	@ApiOkResponse({
		description: 'Task updated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Task not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Task not found' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error updating task' },
			},
		},
	})
	update(@Param('ref') ref: number, @Body() updateTaskDto: UpdateTaskDto) {
		return this.tasksService.update(ref, updateTaskDto);
	}

	@Patch('sub-task/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Update a subtask by reference',
		description: 'Updates an existing subtask with the provided information',
	})
	@ApiParam({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' })
	@ApiBody({ type: UpdateSubtaskDto })
	@ApiOkResponse({
		description: 'Subtask updated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Subtask not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Subtask not found' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error updating subtask' },
			},
		},
	})
	updateSubTask(@Param('ref') ref: number, @Body() updateSubTaskDto: UpdateSubtaskDto) {
		return this.tasksService.updateSubTask(ref, updateSubTaskDto);
	}

	@Patch('sub-task/complete/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Complete a subtask by reference',
		description: 'Marks a subtask as completed',
	})
	@ApiParam({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' })
	@ApiOkResponse({
		description: 'Subtask completed successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Subtask not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Subtask not found' },
			},
		},
	})
	completeSubTask(@Param('ref') ref: number) {
		return this.tasksService.completeSubTask(ref);
	}

	@Delete('sub-task/:ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Soft delete a subtask by reference',
		description: 'Marks a subtask as deleted without removing it from the database',
	})
	@ApiParam({ name: 'ref', description: 'Subtask reference code or ID', type: 'number' })
	@ApiOkResponse({
		description: 'Subtask deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Subtask not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Subtask not found' },
			},
		},
	})
	deleteSubTask(@Param('ref') ref: number) {
		return this.tasksService.deleteSubTask(ref);
	}

	@Delete(':ref')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
	@ApiOperation({
		summary: 'Soft delete a task by reference',
		description: 'Marks a task as deleted without removing it from the database',
	})
	@ApiParam({ name: 'ref', description: 'Task reference code or ID', type: 'number' })
	@ApiOkResponse({
		description: 'Task deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Success' },
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Task not found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error deleting task' },
			},
		},
	})
	remove(@Param('ref') ref: number) {
		return this.tasksService.remove(ref);
	}

	@Get('routes')
	@ApiOperation({
		summary: 'Get optimized routes for tasks',
		description: 'Retrieves optimized routes for tasks on a specific date',
	})
	@ApiQuery({
		name: 'date',
		type: String,
		required: false,
		description: 'Date for which to retrieve routes (ISO format), defaults to current date',
	})
	@ApiOkResponse({
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
	})
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	async getOptimizedRoutes(@Query('date') dateStr?: string): Promise<OptimizedRoute[]> {
		const date = dateStr ? new Date(dateStr) : new Date();

		const routes = await this.taskRouteService.getRoutes(date);

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

	@Post('routes/calculate')
	@ApiOperation({
		summary: 'Calculate optimized routes for tasks on a specific date',
		description: 'Calculates and stores optimized routes for tasks on a specific date',
	})
	@ApiQuery({
		name: 'date',
		type: String,
		required: false,
		description: 'Date for which to calculate routes (ISO format), defaults to current date',
	})
	@ApiOkResponse({
		description: 'Routes calculated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Routes calculated successfully' },
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Bad Request - Invalid date or no tasks found',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Error calculating routes' },
			},
		},
	})
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	async calculateOptimizedRoutes(@Query('date') dateStr?: string): Promise<{ message: string }> {
		const date = dateStr ? new Date(dateStr) : new Date();

		await this.taskRouteService.planRoutes(date);

		return { message: 'Routes calculated successfully' };
	}
}
