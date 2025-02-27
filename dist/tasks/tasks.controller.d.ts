import { TasksService } from './tasks.service';
import { TaskRouteService } from './task-route.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { OptimizedRoute } from './interfaces/route.interface';
export declare class TasksController {
    private readonly tasksService;
    private readonly taskRouteService;
    constructor(tasksService: TasksService, taskRouteService: TaskRouteService);
    create(createTaskDto: CreateTaskDto): Promise<{
        message: string;
    }>;
    findAll(status?: string, priority?: string, assigneeId?: string, clientId?: string, startDate?: string, endDate?: string, isOverdue?: string, page?: string, limit?: string): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/task.entity").Task>> | {
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: any;
    };
    findOne(ref: number): Promise<{
        message: string;
        task: import("./entities/task.entity").Task | null;
    }>;
    tasksByUser(ref: number): Promise<{
        message: string;
        tasks: import("./entities/task.entity").Task[];
    }>;
    findOneSubTask(ref: number): Promise<{
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
    getOptimizedRoutes(dateStr?: string): Promise<OptimizedRoute[]>;
    calculateOptimizedRoutes(dateStr?: string): Promise<{
        message: string;
    }>;
}
