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
import { CommunicationService } from '../communication/communication.service';
import { TaskFlag } from './entities/task-flag.entity';
import { TaskFlagItem } from './entities/task-flag-item.entity';
import { CreateTaskFlagDto } from './dto/create-task-flag.dto';
import { UpdateTaskFlagDto } from './dto/update-task-flag.dto';
import { UpdateTaskFlagItemDto } from './dto/update-task-flag-item.dto';
import { AddCommentDto } from './dto/add-comment.dto';
export declare class TasksService {
    private taskRepository;
    private subtaskRepository;
    private readonly eventEmitter;
    private readonly clientRepository;
    private readonly userRepository;
    private cacheManager;
    private readonly configService;
    private readonly communicationService;
    private taskFlagRepository;
    private taskFlagItemRepository;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    constructor(taskRepository: Repository<Task>, subtaskRepository: Repository<SubTask>, eventEmitter: EventEmitter2, clientRepository: Repository<Client>, userRepository: Repository<User>, cacheManager: Cache, configService: ConfigService, communicationService: CommunicationService, taskFlagRepository: Repository<TaskFlag>, taskFlagItemRepository: Repository<TaskFlagItem>);
    private getCacheKey;
    private clearTaskCache;
    private getTaskFlagCacheKey;
    private getTaskFlagDetailCacheKey;
    private getTaskFlagReportsCacheKey;
    private clearTaskFlagCache;
    private createRepeatingTasks;
    private createSingleRepeatingTask;
    private calculateTotalTasks;
    create(createTaskDto: CreateTaskDto): Promise<{
        message: string;
    }>;
    private populateTaskRelations;
    findOne(ref: number, organisationRef?: string, branchId?: number): Promise<{
        message: string;
        task: Task | null;
    }>;
    tasksByUser(ref: number, organisationRef?: string, branchId?: number): Promise<{
        message: string;
        tasks: Task[];
    }>;
    findAll(filters?: {
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: number;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
        isOverdue?: boolean;
        organisationRef?: string;
        branchId?: number;
    }, page?: number, limit?: number): Promise<PaginatedResponse<Task>>;
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
    findOneSubTask(ref: number, organisationRef?: string, branchId?: number): Promise<{
        tasks: SubTask | null;
        message: string;
    }>;
    private getParentTaskId;
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
    private populateTasksForAnalytics;
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
                totalTasks: number;
                completedTasks: number;
                completionRate: string;
            }[];
            taskPriorityDistribution: Record<TaskPriority, number>;
            assigneePerformance: {
                assigneeId: number;
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
    private getClientNames;
    toggleJobStatus(taskId: number): Promise<{
        task: Partial<Task>;
        message: string;
    }>;
    createTaskFlag(createTaskFlagDto: CreateTaskFlagDto, userId: number): Promise<any>;
    addComment(flagId: number, commentDto: AddCommentDto, userId: number): Promise<any>;
    getTaskFlags(taskId: number, page?: number, limit?: number): Promise<any>;
    getTaskFlag(flagId: number): Promise<any>;
    updateTaskFlag(flagId: number, updateTaskFlagDto: UpdateTaskFlagDto): Promise<any>;
    updateTaskFlagItem(itemId: number, updateDto: UpdateTaskFlagItemDto): Promise<any>;
    deleteTaskFlag(flagId: number): Promise<any>;
    getTaskFlagReports(filters?: any, page?: number, limit?: number): Promise<any>;
}
