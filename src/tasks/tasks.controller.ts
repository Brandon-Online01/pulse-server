import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskRouteService } from './task-route.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { TaskStatus, TaskPriority } from '../lib/enums/task.enums';
import { OptimizedRoute } from './interfaces/route.interface';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskRouteService: TaskRouteService,
  ) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a new task' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all tasks' })
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
      return this.tasksService.findAll(
        Object.keys(filters).length > 0 ? filters : undefined,
        pageNum,
        limitNum
      );
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
  @ApiOperation({ summary: 'get a task by reference' })
  findOne(@Param('ref') ref: number) {
    return this.tasksService.findOne(ref);
  }

  @Get('for/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get tasks by user reference code' })
  tasksByUser(@Param('ref') ref: number) {
    return this.tasksService.tasksByUser(ref);
  }

  @Get('sub-task/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a subtask by reference' })
  findOneSubTask(@Param('ref') ref: number) {
    return this.tasksService.findOneSubTask(ref);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a task by reference' })
  update(@Param('ref') ref: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(ref, updateTaskDto);
  }

  @Patch('sub-task/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a subtask by reference' })
  updateSubTask(@Param('ref') ref: number, @Body() updateSubTaskDto: UpdateSubtaskDto) {
    return this.tasksService.updateSubTask(ref, updateSubTaskDto);
  }

  @Patch('sub-task/complete/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'complete a subtask by reference' })
  completeSubTask(@Param('ref') ref: number) {
    return this.tasksService.completeSubTask(ref);
  }

  @Delete('sub-task/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a subtask by reference' })
  deleteSubTask(@Param('ref') ref: number) {
    return this.tasksService.deleteSubTask(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a task by reference' })
  remove(@Param('ref') ref: number) {
    return this.tasksService.remove(ref);
  }

  @Get('routes')
  @ApiOperation({ summary: 'Get optimized routes for tasks' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
  async getOptimizedRoutes(@Query('date') dateStr?: string): Promise<OptimizedRoute[]> { 
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
          address: '' // This should be populated with actual address if available
        }
      })),
      estimatedDuration: route.totalDuration,
      totalDistance: route.totalDistance
    }));
  }
}
