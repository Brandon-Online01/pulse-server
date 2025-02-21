import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Between, MoreThanOrEqual, LessThanOrEqual, LessThan, Not } from 'typeorm';
import { SubTaskStatus } from '../lib/enums/status.enums';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Client } from '../clients/entities/client.entity';
import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../lib/enums/task.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { User } from '../user/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
	private readonly CACHE_TTL: number;
	private readonly CACHE_PREFIX = 'task:';
	private readonly logger = new Logger(TasksService.name);

	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(SubTask)
		private subtaskRepository: Repository<SubTask>,
		private readonly eventEmitter: EventEmitter2,
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly configService: ConfigService
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async clearTaskCache(taskId?: number): Promise<void> {
		try {
			if (taskId) {
				await this.cacheManager.del(this.getCacheKey(taskId));
			}
			await this.cacheManager.del(this.getCacheKey('all'));
		} catch (error) {
			this.logger.error('Error clearing cache:', error);
		}
	}

	private async createRepeatingTasks(baseTask: Task, createTaskDto: CreateTaskDto): Promise<void> {
		if (!createTaskDto.repetitionType || createTaskDto.repetitionType === RepetitionType.NONE || !createTaskDto.deadline || !createTaskDto.repetitionEndDate) {
			return;
		}

		let currentDate = new Date(createTaskDto?.deadline);
		const endDate = new Date(createTaskDto?.repetitionEndDate);
		let tasksCreated = 0;
		const totalTasks = this.calculateTotalTasks(currentDate, endDate, createTaskDto?.repetitionType);

		while (currentDate < endDate) {
			let nextDate: Date;
			switch (createTaskDto?.repetitionType) {
				case RepetitionType.DAILY:
					nextDate = addDays(currentDate, 1);
					break;
				case RepetitionType.WEEKLY:
					nextDate = addWeeks(currentDate, 1);
					break;
				case RepetitionType.MONTHLY:
					nextDate = addMonths(currentDate, 1);
					break;
				case RepetitionType.YEARLY:
					nextDate = addYears(currentDate, 1);
					break;
				default:
					return;
			}

			// Skip if we've somehow gone past the end date
			if (nextDate > endDate) {
				break;
			}

			const repeatedTask = new Task();
			const formattedDate = nextDate.toLocaleDateString('en-US', { 
				month: 'short', 
				day: 'numeric',
				year: 'numeric'
			});
			
			repeatedTask.title = `${createTaskDto?.title} (${tasksCreated + 1}/${totalTasks}) - ${formattedDate}`;
			repeatedTask.description = `${createTaskDto?.description}\n\nRecurring ${createTaskDto?.repetitionType.toLowerCase()} task (Part ${tasksCreated + 1} of ${totalTasks})`;
			repeatedTask.deadline = nextDate;
			repeatedTask.assignees = baseTask?.assignees;
			repeatedTask.clients = baseTask?.clients;
			repeatedTask.status = TaskStatus.PENDING;
			repeatedTask.taskType = createTaskDto?.taskType || TaskType.OTHER;
			repeatedTask.priority = createTaskDto?.priority;
			repeatedTask.attachments = createTaskDto?.attachments;
			repeatedTask.lastCompletedAt = null;
			repeatedTask.repetitionType = RepetitionType.NONE;
			repeatedTask.repetitionEndDate = null;
			repeatedTask.creator = baseTask?.creator;
			repeatedTask.targetCategory = createTaskDto?.targetCategory;

			await this.taskRepository.save(repeatedTask);

			currentDate = nextDate;
			tasksCreated++;
		}
	}

	private calculateTotalTasks(startDate: Date, endDate: Date, repetitionType: RepetitionType): number {
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		switch (repetitionType) {
			case RepetitionType.DAILY:
				return diffDays;
			case RepetitionType.WEEKLY:
				return Math.ceil(diffDays / 7);
			case RepetitionType.MONTHLY:
				return Math.ceil(diffDays / 30);
			case RepetitionType.YEARLY:
				return Math.ceil(diffDays / 365);
			default:
				return 0;
		}
	}

	async create(createTaskDto: CreateTaskDto, user?: any): Promise<{ message: string }> {
		try {
			// Set default values and validate dates
			const now = new Date();
			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			if (createTaskDto?.deadline && new Date(createTaskDto?.deadline) < startOfToday) {
				throw new BadRequestException('Task deadline cannot be in the past');
			}

			if (createTaskDto?.repetitionEndDate && new Date(createTaskDto?.repetitionEndDate) < startOfToday) {
				throw new BadRequestException('Repetition end date cannot be in the past');
			}

			// Create task data
			const taskData = {
				...createTaskDto,
				creator: user?.uid ? { uid: user.uid } : undefined,
				status: TaskStatus.PENDING,
				progress: 0,
				assignees: [],
				clients: [],
				attachments: createTaskDto?.attachments || []
			};

			// Handle assignees
			if (createTaskDto?.assignees?.length > 0) {
				const assigneeUsers = [];

				for (const assignee of createTaskDto?.assignees) {
					const user = await this.userRepository.findOne({
						where: { uid: assignee?.uid }
					});

					if (user) {
						assigneeUsers?.push(user);
					}
				}

				taskData.assignees = assigneeUsers;
			}

			// Handle client assignments
			const clientUids = new Set();

			// Case 1: Specific client selected
			if (createTaskDto?.client?.uid) {
				clientUids.add(createTaskDto?.client?.uid);
			}

			// Case 2: Target category specified
			if (createTaskDto?.targetCategory) {
				const categoryClients = await this.clientRepository.find({
					where: {
						category: createTaskDto?.targetCategory,
						isDeleted: false
					},
					select: ['uid']
				});

				categoryClients.forEach(client => clientUids.add(client.uid));
			}

			// Convert client UIDs to the correct format for ManyToMany relationship
			if (clientUids.size > 0) {
				const clients = await this.clientRepository.findByIds(Array.from(clientUids));
				taskData.clients = clients;
			}

			const task = await this.taskRepository.save(taskData);

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Create future instances if task is repeating
			if (createTaskDto?.repetitionType !== RepetitionType.NONE) {
				await this.createRepeatingTasks(task, createTaskDto);
			}

			// Create subtasks if provided
			if (createTaskDto?.subtasks?.length > 0) {
				const subtasks = createTaskDto?.subtasks?.map(subtask => ({
					...subtask,
					task: { uid: task.uid },
					status: SubTaskStatus.PENDING
				}));

				await this.subtaskRepository.save(subtasks);
			}

			// Clear cache after creating new task
			await this.clearTaskCache();

			return {
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message
			};
		}
	}

	async findAll(
		filters?: {
			status?: TaskStatus;
			priority?: TaskPriority;
			assigneeId?: number;
			clientId?: number;
			startDate?: Date;
			endDate?: Date;
			isOverdue?: boolean;
		},
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT)
	): Promise<PaginatedResponse<Task>> {
		try {
			const cacheKey = this.getCacheKey('all');
			const cachedTasks = await this.cacheManager.get<PaginatedResponse<Task>>(cacheKey);

			if (cachedTasks) {
				return cachedTasks;
			}

			// Build where conditions
			const where: any = { isDeleted: false };
			
			if (filters?.status) {
				where.status = filters.status;
			}
			
			if (filters?.priority) {
				where.priority = filters.priority;
			}

			if (filters?.startDate) {
				where.deadline = MoreThanOrEqual(filters.startDate);
			}

			if (filters?.endDate) {
				where.deadline = LessThanOrEqual(filters.endDate);
			}

			if (filters?.isOverdue) {
				where.deadline = LessThan(new Date());
				where.status = Not(TaskStatus.COMPLETED);
			}

			const [tasks, total] = await this.taskRepository.findAndCount({
				where,
				relations: ['subtasks', 'creator',],
				skip: (page - 1) * limit,
				take: limit,
				order: {
					createdAt: 'DESC'
				}
			});

			// Post-process for assignee and client filters
			let filteredTasks = tasks;
			
			if (filters?.assigneeId) {
				filteredTasks = filteredTasks?.filter(task => 
					task.assignees?.some(assignee => assignee?.uid === filters?.assigneeId)
				);
			}

			if (filters?.clientId) {
				filteredTasks = filteredTasks?.filter(task => 
					task.clients?.some(client => client?.uid === filters?.clientId)
				);
			}

			const response = {
				data: filteredTasks,
				meta: {
					total: filteredTasks?.length,
					page,
					limit,
					totalPages: Math.ceil(filteredTasks?.length / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};

			await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);

			return response;
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
				message: error?.message,
			};
		}
	}

	async findOne(ref: number): Promise<{ message: string, task: Task | null }> {
		try {
			const cacheKey = this.getCacheKey(ref);
			const cachedTask = await this.cacheManager.get<Task>(cacheKey);

			if (cachedTask) {
				return {
					task: cachedTask,
					message: process.env.SUCCESS_MESSAGE
				};
			}

			const task = await this.taskRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false
				},
				relations: ['assignees', 'clients', 'creator', 'subtasks']
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.cacheManager.set(cacheKey, task, this.CACHE_TTL);

			return {
				task,
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				task: null,
				message: error?.message
			};
		}
	}

	public async tasksByUser(ref: number): Promise<{ message: string, tasks: Task[] }> {
		try {
			const tasks = await this.taskRepository.find({
				where: { creator: { uid: ref }, isDeleted: false },
			});

			if (!tasks) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				tasks
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get tasks by user - ${error?.message}`,
				tasks: null
			}

			return response;
		}
	}

	async update(ref: number, updateTaskDto: UpdateTaskDto): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false
				}
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Handle assignees
			if (updateTaskDto?.assignees?.length > 0) {
				const assigneeUsers = [];

				for (const assignee of updateTaskDto?.assignees) {
					const user = await this.userRepository.findOne({
						where: { uid: assignee?.uid }
					});

					if (user) {
						assigneeUsers?.push(user);
					}
				}

				updateTaskDto.assignees = assigneeUsers;
			}

			// Handle client assignments
			if (updateTaskDto?.clients?.length > 0) {
				const clients = await this.clientRepository.findByIds(
					updateTaskDto.clients.map(client => client.uid)
				);
				updateTaskDto.clients = clients;
			}

			await this.taskRepository.save({
				...task,
				...updateTaskDto
			});

			// Clear cache after update
			await this.clearTaskCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message
			};
		}
	}

	async remove(ref: number): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false
				}
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.taskRepository.update(ref, { isDeleted: true });

			// Clear cache after deletion
			await this.clearTaskCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message
			};
		}
	}

	async getTaskStatusSummary(): Promise<{
		byStatus: Record<TaskStatus, number>;
		total: number;
	}> {
		try {
			const today = new Date();
			const startOfDay = new Date(today.setHours(0, 0, 0, 0));
			const endOfDay = new Date(today.setHours(23, 59, 59, 999));

			const tasks = await this.taskRepository.find({
				where: {
					isDeleted: false,
					deadline: Between(startOfDay, endOfDay)
				},
			});

			const byStatus: Record<TaskStatus, number> = {
				[TaskStatus.PENDING]: 0,
				[TaskStatus.IN_PROGRESS]: 0,
				[TaskStatus.COMPLETED]: 0,
				[TaskStatus.CANCELLED]: 0,
				[TaskStatus.OVERDUE]: 0,
				[TaskStatus.POSTPONED]: 0,
				[TaskStatus.MISSED]: 0
			};

			tasks.forEach(task => {
				if (task.status) byStatus[task.status]++;
			});

			return {
				byStatus,
				total: tasks.length
			};

		} catch (error) {
			return {
				byStatus: Object.values(TaskStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {} as Record<TaskStatus, number>),
				total: 0
			};
		}
	}

	public async getTasksForDate(date: Date): Promise<{ total: number }> {
		try {
			// Create new Date objects to avoid modifying the input date
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const tasks = await this.taskRepository.count({
				where: {
					createdAt: Between(startOfDay, endOfDay),
					isDeleted: false
				},
				relations: ['subtasks']
			});

			return { total: tasks };
		} catch (error) {
			return { total: 0 };
		}
	}

	async findOneSubTask(ref: number): Promise<{ tasks: SubTask | null, message: string }> {
		try {
			const subtask = await this.subtaskRepository.findOne({
				where: { uid: ref, isDeleted: false },
			});

			if (!subtask) {
				return {
					tasks: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			return {
				tasks: subtask,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				tasks: null
			};
		}
	}

	async updateSubTask(ref: number, updateSubTaskDto: UpdateSubtaskDto): Promise<{ message: string }> {
		try {
			await this.subtaskRepository.update(ref, updateSubTaskDto);
			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async deleteSubTask(ref: number): Promise<{ message: string }> {
		try {
			await this.subtaskRepository.delete(ref);
			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async completeSubTask(ref: number): Promise<{ message: string }> {
		try {
			await this.subtaskRepository.update(ref, { status: SubTaskStatus.COMPLETED });
			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async updateProgress(ref: number, progress: number): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: { uid: ref, isDeleted: false },
				relations: ['assignees', 'createdBy']
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Validate progress value
			if (progress < 0 || progress > 100) {
				throw new BadRequestException('Progress must be between 0 and 100');
			}

			// Update progress and let the entity hooks handle status updates
			task.progress = progress;
			await this.taskRepository.save(task);

			// Send notification if task is completed
			if (progress === 100) {
				const notification = {
					type: NotificationType.USER,
					title: 'Task Completed',
					message: `Task "${task.title}" has been marked as complete`,
					status: NotificationStatus.UNREAD,
					owner: null
				};

				const recipients = [
					task.creator.uid,
					...(task.assignees?.map(assignee => assignee.uid) || [])
				];

				const uniqueRecipients = [...new Set(recipients)];
				uniqueRecipients.forEach(recipientId => {
					this.eventEmitter.emit('send.notification', {
						...notification,
						owner: { uid: recipientId },
						metadata: {
							taskId: task.uid,
							completedAt: new Date()
						}
					}, [recipientId]);
				});
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			throw new BadRequestException(error?.message);
		}
	}

	async getTasksReport(filter: any) {
		try {
			const tasks = await this.taskRepository.find({
				where: {
					...filter,
					isDeleted: false
				},
			});

			if (!tasks) {
				throw new NotFoundException('No tasks found for the specified period');
			}

			const groupedTasks = {
				pending: tasks.filter(task => task.status === TaskStatus.PENDING),
				inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
				completed: tasks.filter(task => task.status === TaskStatus.COMPLETED),
				overdue: tasks.filter(task => task.status === TaskStatus.OVERDUE)
			};

			const totalTasks = tasks.length;
			const completedTasks = groupedTasks.completed.length;
			const avgCompletionTime = this.calculateAverageCompletionTime(tasks);
			const overdueRate = this.calculateOverdueRate(tasks);
			const taskDistribution = this.analyzeTaskDistribution(tasks);
			const incompletionReasons = this.analyzeIncompletionReasons(tasks);
			const clientCompletionRates = this.analyzeClientCompletionRates(tasks);
			const taskPriorityDistribution = this.analyzeTaskPriorityDistribution(tasks);
			const assigneePerformance = this.analyzeAssigneePerformance(tasks);

			return {
				...groupedTasks,
				total: totalTasks,
				metrics: {
					completionRate: `${((completedTasks / totalTasks) * 100).toFixed(1)}%`,
					averageCompletionTime: `${avgCompletionTime} hours`,
					overdueRate: `${overdueRate}%`,
					taskDistribution,
					incompletionReasons,
					clientCompletionRates,
					taskPriorityDistribution,
					assigneePerformance
				}
			};
		} catch (error) {
			return null;
		}
	}

	private calculateAverageCompletionTime(tasks: Task[]): number {
		const completedTasks = tasks.filter(task =>
			task.status === TaskStatus.COMPLETED &&
			task.lastCompletedAt
		);

		if (completedTasks.length === 0) return 0;

		const totalCompletionTime = completedTasks.reduce((sum, task) => {
			const completionTime = task.lastCompletedAt.getTime() - task.createdAt.getTime();
			return sum + completionTime;
		}, 0);

		// Convert from milliseconds to hours
		return Number((totalCompletionTime / (completedTasks.length * 60 * 60 * 1000)).toFixed(1));
	}

	private calculateOverdueRate(tasks: Task[]): number {
		if (tasks.length === 0) return 0;
		const overdueTasks = tasks.filter(task => task.isOverdue || task.status === TaskStatus.OVERDUE).length;
		return Number(((overdueTasks / tasks.length) * 100).toFixed(1));
	}

	private analyzeTaskDistribution(tasks: Task[]): Record<TaskType, number> {
		const distribution: Record<TaskType, number> = Object.values(TaskType).reduce((acc, type) => {
			acc[type] = 0;
			return acc;
		}, {} as Record<TaskType, number>);

		tasks.forEach(task => {
			distribution[task.taskType] = (distribution[task.taskType] || 0) + 1;
		});
		return distribution;
	}

	private analyzeIncompletionReasons(tasks: Task[]): Array<{ reason: string; count: number }> {
		const reasons: Record<string, number> = {};
		tasks.forEach(task => {
			if (task.status !== TaskStatus.COMPLETED) {
				const reason = this.determineIncompletionReason(task);
				reasons[reason] = (reasons[reason] || 0) + 1;
			}
		});
		return Object.entries(reasons)
			.map(([reason, count]) => ({ reason, count }))
			.sort((a, b) => b.count - a.count);
	}

	private determineIncompletionReason(task: Task): string {
		if (task.status === TaskStatus.OVERDUE) return 'Deadline Missed';
		if (task.status === TaskStatus.CANCELLED) return 'Cancelled';
		if (task.status === TaskStatus.MISSED) {
			if (!task.lastCompletedAt) return 'Never Started';
			if (task.progress < 50) return 'Insufficient Progress';
			return 'Incomplete Work';
		}
		return 'Other';
	}

	private analyzeClientCompletionRates(tasks: Task[]): Array<{
		clientId: number;
		clientName: string;
		totalTasks: number;
		completedTasks: number;
		completionRate: string;
	}> {
		const clientStats: Record<number, {
			clientName: string;
			totalTasks: number;
			completedTasks: number;
		}> = {};

		tasks.forEach(task => {
			task.clients?.forEach(client => {
				if (!clientStats[client.uid]) {
					clientStats[client.uid] = {
						clientName: client.name,
						totalTasks: 0,
						completedTasks: 0
					};
				}
				clientStats[client.uid].totalTasks++;
				if (task.status === TaskStatus.COMPLETED) {
					clientStats[client.uid].completedTasks++;
				}
			});
		});

		return Object.entries(clientStats).map(([clientId, stats]) => ({
			clientId: parseInt(clientId),
			clientName: stats.clientName,
			totalTasks: stats.totalTasks,
			completedTasks: stats.completedTasks,
			completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`
		}));
	}

	private analyzeTaskPriorityDistribution(tasks: Task[]): Record<TaskPriority, number> {
		const distribution: Record<TaskPriority, number> = Object.values(TaskPriority).reduce((acc, priority) => {
			acc[priority] = 0;
			return acc;
		}, {} as Record<TaskPriority, number>);

		tasks.forEach(task => {
			distribution[task.priority] = (distribution[task.priority] || 0) + 1;
		});
		return distribution;
	}

	private analyzeAssigneePerformance(tasks: Task[]): Array<{
		assigneeId: number;
		assigneeName: string;
		totalTasks: number;
		completedTasks: number;
		completionRate: string;
		averageCompletionTime: string;
	}> {
		const assigneeStats: Record<number, {
			assigneeName: string;
			totalTasks: number;
			completedTasks: number;
			totalCompletionTime: number;
		}> = {};

		tasks.forEach(task => {
			task.assignees?.forEach(assignee => {
				if (!assigneeStats[assignee.uid]) {
					assigneeStats[assignee.uid] = {
						assigneeName: assignee.username,
						totalTasks: 0,
						completedTasks: 0,
						totalCompletionTime: 0
					};
				}
				assigneeStats[assignee.uid].totalTasks++;
				if (task.status === TaskStatus.COMPLETED && task.lastCompletedAt) {
					assigneeStats[assignee.uid].completedTasks++;
					assigneeStats[assignee.uid].totalCompletionTime +=
						new Date(task.lastCompletedAt).getTime() - new Date(task.createdAt).getTime();
				}
			});
		});

		return Object.entries(assigneeStats).map(([assigneeId, stats]) => ({
			assigneeId: parseInt(assigneeId),
			assigneeName: stats.assigneeName,
			totalTasks: stats.totalTasks,
			completedTasks: stats.completedTasks,
			completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`,
			averageCompletionTime: stats.completedTasks > 0
				? `${Math.round(stats.totalCompletionTime / stats.completedTasks / (1000 * 60 * 60))} hours`
				: 'N/A'
		}));
	}
}
