import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { Client } from '../clients/entities/client.entity';
import { TaskStatus, TaskPriority, TaskType } from '../lib/enums/task.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { User } from '../user/entities/user.entity';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
export declare class TasksService {
    private taskRepository;
    private subtaskRepository;
    private readonly eventEmitter;
    private readonly clientRepository;
    private readonly userRepository;
    private cacheManager;
    private readonly configService;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    private readonly logger;
    constructor(taskRepository: Repository<Task>, subtaskRepository: Repository<SubTask>, eventEmitter: EventEmitter2, clientRepository: Repository<Client>, userRepository: Repository<User>, cacheManager: Cache, configService: ConfigService);
    private getCacheKey;
    private clearTaskCache;
    private createRepeatingTasks;
    private calculateTotalTasks;
    create(createTaskDto: CreateTaskDto, user?: any): Promise<{
        message: string;
    }>;
    findAll(filters?: {
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: number;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
        isOverdue?: boolean;
    }, page?: number, limit?: number): Promise<PaginatedResponse<Task>>;
    findOne(ref: number): Promise<{
        message: string;
        task: Task | null;
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
    updateProgress(ref: number, progress: number): Promise<{
        message: string;
    }>;
    getTasksReport(filter: any): Promise<{
        total: number;
        metrics: {
            completionRate: string;
            averageCompletionTime: string;
            overdueRate: string;
            taskDistribution: Record<TaskType, number>;
            incompletionReasons: {
                reason: string;
                count: number;
            }[];
            clientCompletionRates: {
                clientId: number;
                clientName: string;
                totalTasks: number;
                completedTasks: number;
                completionRate: string;
            }[];
            taskPriorityDistribution: Record<TaskPriority, number>;
            assigneePerformance: {
                assigneeId: number;
                assigneeName: string;
                totalTasks: number;
                completedTasks: number;
                completionRate: string;
                averageCompletionTime: string;
            }[];
        };
        pending: Task[];
        inProgress: Task[];
        completed: Task[];
        overdue: Task[];
    }>;
    private calculateAverageCompletionTime;
    private calculateOverdueRate;
    private analyzeTaskDistribution;
    private analyzeIncompletionReasons;
    private determineIncompletionReason;
    private analyzeClientCompletionRates;
    private analyzeTaskPriorityDistribution;
    private analyzeAssigneePerformance;
}
