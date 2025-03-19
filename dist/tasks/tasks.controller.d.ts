import { TasksService } from './tasks.service';
import { TaskRouteService } from './task-route.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { OptimizedRoute } from './interfaces/route.interface';
import { CreateTaskFlagDto } from './dto/create-task-flag.dto';
import { UpdateTaskFlagDto } from './dto/update-task-flag.dto';
import { UpdateTaskFlagItemDto } from './dto/update-task-flag-item.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { TaskFlagStatus } from '../lib/enums/task.enums';
export declare class TasksController {
    private readonly tasksService;
    private readonly taskRouteService;
    constructor(tasksService: TasksService, taskRouteService: TaskRouteService);
    create(createTaskDto: CreateTaskDto): Promise<{
        message: string;
    }>;
    findAll(status?: string, priority?: string, assigneeId?: string, clientId?: string, startDate?: string, endDate?: string, isOverdue?: string, page?: string, limit?: string, req?: any): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/task.entity").Task>> | {
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: any;
    };
    findOne(ref: number, req?: any): Promise<{
        message: string;
        task: import("./entities/task.entity").Task | null;
    }>;
    tasksByUser(ref: number, req?: any): Promise<{
        message: string;
        tasks: import("./entities/task.entity").Task[];
    }>;
    findOneSubTask(ref: number, req?: any): Promise<{
        tasks: import("./entities/subtask.entity").SubTask | null;
        message: string;
    }>;
    update(ref: number, updateTaskDto: UpdateTaskDto): Promise<{
        message: string;
    }>;
    updateSubTask(ref: number, updateSubTaskDto: UpdateSubtaskDto): Promise<{
        message: string;
    }>;
    completeSubTask(ref: number): Promise<{
        message: string;
    }>;
    deleteSubTask(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    getOptimizedRoutes(dateStr?: string, req?: any): Promise<OptimizedRoute[]>;
    calculateOptimizedRoutes(dateStr?: string, req?: any): Promise<{
        message: string;
    }>;
    toggleJobStatus(id: string): Promise<{
        task: Partial<import("./entities/task.entity").Task>;
        message: string;
    }>;
    createTaskFlag(createTaskFlagDto: CreateTaskFlagDto, req: any): Promise<any>;
    addComment(flagId: number, commentDto: AddCommentDto, req: any): Promise<any>;
    getTaskFlags(taskId: number, page?: string, limit?: string): Promise<any>;
    getTaskFlag(flagId: number): Promise<any>;
    updateTaskFlag(flagId: number, updateTaskFlagDto: UpdateTaskFlagDto): Promise<any>;
    updateTaskFlagItem(itemId: number, updateTaskFlagItemDto: UpdateTaskFlagItemDto): Promise<any>;
    deleteTaskFlag(flagId: number): Promise<any>;
    getTaskFlagReports(status?: TaskFlagStatus, startDate?: string, endDate?: string, deadlineBefore?: string, deadlineAfter?: string, userId?: number, page?: string, limit?: string, req?: any): Promise<any>;
}
