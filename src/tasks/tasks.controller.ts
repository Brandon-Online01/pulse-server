import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from 'src/lib/enums/user.enums';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RoleGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a new task' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all tasks' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a task by reference' })
  findOne(@Param('ref') ref: number) {
    return this.tasksService.findOne(ref);
  }

  @Get('for/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get tasks by user reference code' })
  tasksByUser(@Param('ref') ref: number) {
    return this.tasksService.tasksByUser(ref);
  }

  @Get('sub-task/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a subtask by reference' })
  findOneSubTask(@Param('ref') ref: number) {
    return this.tasksService.findOneSubTask(ref);
  }

  @Patch(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a task by reference' })
  update(@Param('ref') ref: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(ref, updateTaskDto);
  }

  @Patch('sub-task/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a subtask by reference' })
  updateSubTask(@Param('ref') ref: number, @Body() updateSubTaskDto: UpdateSubtaskDto) {
    return this.tasksService.updateSubTask(ref, updateSubTaskDto);
  }

  @Patch('sub-task/complete/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'complete a subtask by reference' })
  completeSubTask(@Param('ref') ref: number) {
    return this.tasksService.completeSubTask(ref);
  }

  @Delete('sub-task/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a subtask by reference' })
  deleteSubTask(@Param('ref') ref: number) {
    return this.tasksService.deleteSubTask(ref);
  }

  @Delete(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a task by reference' })
  remove(@Param('ref') ref: number) {
    return this.tasksService.remove(ref);
  }
}
