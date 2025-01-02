import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        tasks: import("./entities/task.entity").Task[] | null;
        message: string;
    }>;
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
