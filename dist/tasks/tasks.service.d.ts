import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskStatus } from 'src/lib/enums/status.enums';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { RewardsService } from 'src/rewards/rewards.service';
export declare class TasksService {
    private taskRepository;
    private subtaskRepository;
    private readonly eventEmitter;
    private readonly rewardsService;
    constructor(taskRepository: Repository<Task>, subtaskRepository: Repository<SubTask>, eventEmitter: EventEmitter2, rewardsService: RewardsService);
    create(createTaskDto: CreateTaskDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        tasks: Task[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        task: Task | null;
        message: string;
    }>;
    tasksByUser(ref: number): Promise<{
        message: string;
        tasks: Task[];
    }>;
    update(ref: number, updateTaskDto: UpdateTaskDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    getTaskStatusSummary(): Promise<{
        byStatus: Record<TaskStatus, number>;
        total: number;
    }>;
    getTasksForDate(date: Date): Promise<{
        total: number;
    }>;
    findOneSubTask(ref: number): Promise<{
        tasks: SubTask | null;
        message: string;
    }>;
    updateSubTask(ref: number, updateSubTaskDto: UpdateSubtaskDto): Promise<{
        message: string;
    }>;
    deleteSubTask(ref: number): Promise<{
        message: string;
    }>;
    completeSubTask(ref: number): Promise<{
        message: string;
    }>;
}
