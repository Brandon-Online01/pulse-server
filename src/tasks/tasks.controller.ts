import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
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

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

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
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('assigneeId') assigneeId?: number,
    @Query('clientId') clientId?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('isOverdue') isOverdue?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId: Number(assigneeId) }),
      ...(clientId && { clientId: Number(clientId) }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(isOverdue !== undefined && { isOverdue: Boolean(isOverdue) }),
    };

    return this.tasksService.findAll(
      filters,
      page ? Number(page) : 1,
      limit ? Number(limit) : Number(process.env.DEFAULT_PAGE_LIMIT)
    );
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
}
