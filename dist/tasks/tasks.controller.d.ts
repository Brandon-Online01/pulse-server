import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { TaskStatus, TaskPriority } from '../lib/enums/task.enums';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<{
        message: string;
    }>;
    findAll(status?: TaskStatus, priority?: TaskPriority, assigneeId?: number, clientId?: number, startDate?: Date, endDate?: Date, isOverdue?: boolean, page?: number, limit?: number): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/task.entity").Task>>;
    findOne(ref: number): Promise<{
        task: import("./entities/task.entity").Task | null;
        message: string;
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
}
