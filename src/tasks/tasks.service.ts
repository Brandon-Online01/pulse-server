import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Between, MoreThanOrEqual, LessThanOrEqual, LessThan, Not, In } from 'typeorm';
import { SubTaskStatus } from '../lib/enums/status.enums';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Client } from '../clients/entities/client.entity';
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../lib/enums/task.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { User } from '../user/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { DeepPartial } from 'typeorm';
import { CommunicationService } from '../communication/communication.service';
import { EmailType } from '../lib/enums/email.enums';

@Injectable()
export class TasksService {
	private readonly CACHE_TTL: number;
	private readonly CACHE_PREFIX = 'task:';

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
		private readonly configService: ConfigService,
		private readonly communicationService: CommunicationService,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async clearTaskCache(taskId?: number): Promise<void> {
		try {
			// Get all cache keys
			const keys = await this.cacheManager.store.keys();

			// Keys to clear
			const keysToDelete = [];

			// If specific task, clear its cache
			if (taskId) {
				keysToDelete.push(this.getCacheKey(taskId));
			}

			// Clear all pagination and filtered task list caches
			const taskListCaches = keys.filter(
				(key) =>
					key.startsWith('tasks_page') || // Pagination caches
					key.startsWith('task:all') || // All tasks cache
					key.includes('_limit'), // Filtered caches
			);
			keysToDelete.push(...taskListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
		} catch (error) {
			return error;
		}
	}

	private async createRepeatingTasks(baseTask: Task, createTaskDto: CreateTaskDto): Promise<void> {
		// Early return if no repetition is needed
		if (
			!createTaskDto.repetitionType ||
			createTaskDto.repetitionType === RepetitionType.NONE ||
			!createTaskDto.deadline ||
			!createTaskDto.repetitionDeadline
		) {
			return;
		}

		// Parse dates properly handling timezone
		const startDate = new Date(createTaskDto.deadline);
		const endDate = new Date(createTaskDto.repetitionDeadline);

		// Validate dates
		if (endDate <= startDate) {
			throw new BadRequestException('Repetition end date must be after the start date');
		}

		// Calculate total tasks and initialize counter
		let currentDate = new Date(startDate); // Create new date object to avoid reference issues
		const totalTasks = this.calculateTotalTasks(startDate, endDate, createTaskDto.repetitionType);
		let tasksCreated = 0;

		// Format the repetition type for display
		const repetitionTypeDisplay = createTaskDto.repetitionType.toLowerCase();

		// Create first task (for the start date)
		try {
			const firstTask = await this.createSingleRepeatingTask(
				baseTask,
				createTaskDto,
				startDate,
				1,
				totalTasks,
				repetitionTypeDisplay,
				startDate,
				endDate,
			);
			tasksCreated++;
		} catch (error) {
			return error;
		}

		// Now create the remaining tasks
		while (currentDate < endDate) {
			try {
				// Calculate next date based on repetition type
				let nextDate: Date;
				switch (createTaskDto.repetitionType) {
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

				// Break if we've gone past the end date
				if (nextDate > endDate) {
					break;
				}

				// Create the task for this date
				await this.createSingleRepeatingTask(
					baseTask,
					createTaskDto,
					nextDate,
					tasksCreated + 2, // +2 because we already created the first task
					totalTasks,
					repetitionTypeDisplay,
					startDate,
					endDate,
				);

				currentDate = nextDate;
				tasksCreated++;
			} catch (error) {
				return error;
			}
		}
	}

	private async createSingleRepeatingTask(
		baseTask: Task,
		createTaskDto: CreateTaskDto,
		taskDate: Date,
		sequenceNumber: number,
		totalTasks: number,
		repetitionTypeDisplay: string,
		seriesStart: Date,
		seriesEnd: Date,
	): Promise<Task> {
		// Format date for display
		const formattedDate = taskDate.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});

		// Create the repeated task
		const repeatedTask = this.taskRepository.create({
			title: `${createTaskDto.title} (#${sequenceNumber}/${totalTasks}) - ${formattedDate}`,
			description: `${
				createTaskDto.description
			}\n\n---\nRecurring Task Information:\n- Part ${sequenceNumber} of ${totalTasks}\n- Repeats: ${repetitionTypeDisplay}\n- Original Task: ${
				createTaskDto.title
			}\n- Series Start: ${seriesStart.toLocaleDateString()}\n- Series End: ${seriesEnd.toLocaleDateString()}`,
			deadline: taskDate,
			assignees: createTaskDto.assignees?.map((a) => ({ uid: a.uid })) || [],
			clients: createTaskDto.client?.map((c) => ({ uid: c.uid })) || [],
			status: TaskStatus.PENDING,
			taskType: createTaskDto.taskType || TaskType.OTHER,
			priority: createTaskDto.priority,
			completionDate: null,
			repetitionType: RepetitionType.NONE, // Prevent infinite recursion
			repetitionDeadline: null,
			creator: baseTask.creator,
			targetCategory: createTaskDto.targetCategory,
			progress: 0,
			isOverdue: false,
			isDeleted: false,
			organisation: baseTask.organisation,
			branch: baseTask.branch,
		});

		// Save the task
		const savedTask = await this.taskRepository.save(repeatedTask);

		// Create subtasks if they exist in the DTO
		if (createTaskDto.subtasks?.length > 0) {
			try {
				// Create subtasks with proper task relation
				const subtasks = createTaskDto.subtasks.map((subtask) => ({
					title: subtask.title,
					description: subtask.description,
					status: SubTaskStatus.PENDING,
					task: { uid: savedTask.uid }, // Properly reference the parent task
					isDeleted: false,
					createdAt: new Date(),
					updatedAt: new Date()
				}));

				// Save all subtasks
				const savedSubtasks = await this.subtaskRepository.save(subtasks);
				
				if (!savedSubtasks) {
					throw new Error('Failed to save subtasks');
				}

				// Update the task with subtasks relation
				savedTask.subtasks = savedSubtasks;
				await this.taskRepository.save(savedTask);
			} catch (error) {
				throw new Error(`Failed to create subtasks: ${error.message}`);
			}
		}

		// Emit event for task creation
		this.eventEmitter.emit('task.created', {
			task: savedTask,
			isRecurring: true,
			sequenceNumber,
			totalTasks,
			hasSubtasks: createTaskDto.subtasks?.length > 0,
		});

		// Clear cache after task creation
		await this.clearTaskCache();

		return savedTask;
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

	async create(createTaskDto: CreateTaskDto): Promise<{ message: string }> {
		try {
			const now = new Date();
			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			if (createTaskDto.deadline && new Date(createTaskDto.deadline) < startOfToday) {
				throw new BadRequestException('Task deadline cannot be in the past');
			}

			if (createTaskDto.repetitionDeadline && new Date(createTaskDto.repetitionDeadline) < startOfToday) {
				throw new BadRequestException('Repetition end date cannot be in the past');
			}

			try {
				// First get the creator
				let creator = null;
				if (createTaskDto.creators?.length > 0) {
					creator = await this.userRepository.findOne({
						where: { uid: createTaskDto.creators[0].uid },
						relations: ['organisation', 'branch'],
					});

					if (!creator) {
						throw new BadRequestException(`Creator with ID ${createTaskDto.creators[0].uid} not found`);
					}
				}

				// Prepare assignees and clients
				const assignees = createTaskDto.assignees?.map((a) => ({ uid: a.uid })) || [];
				const clients = createTaskDto.client?.map((c) => ({ uid: c.uid })) || [];

				// Create base task data with all necessary fields
				const taskData: DeepPartial<Task> = {
					title: createTaskDto.title,
					description: createTaskDto.description,
					taskType: createTaskDto.taskType,
					priority: createTaskDto.priority,
					deadline: createTaskDto.deadline ? new Date(createTaskDto.deadline) : null,
					repetitionType: createTaskDto.repetitionType || RepetitionType.NONE,
					repetitionDeadline: createTaskDto.repetitionDeadline
						? new Date(createTaskDto.repetitionDeadline)
						: null,
					targetCategory: createTaskDto.targetCategory,
					isDeleted: false,
					isOverdue: false,
					completionDate: null,
					creator: creator,
					organisation: creator?.organisation || null,
					branch: creator?.branch || null,
					assignees,
					clients,
				};

				// Create and save the task
				const task = this.taskRepository.create(taskData);
				const savedTask = await this.taskRepository.save(task);

				if (!savedTask) {
					throw new Error('Failed to save task');
				}

				// Create subtasks if they exist in the DTO
				if (createTaskDto.subtasks?.length > 0) {
					try {
						// Create subtasks with proper task relation
						const subtasks = createTaskDto.subtasks.map((subtask) => ({
							title: subtask.title,
							description: subtask.description,
							status: SubTaskStatus.PENDING,
							task: { uid: savedTask.uid }, // Properly reference the parent task
							isDeleted: false,
							createdAt: new Date(),
							updatedAt: new Date()
						}));

						// Save all subtasks
						const savedSubtasks = await this.subtaskRepository.save(subtasks);
						
						if (!savedSubtasks) {
							throw new Error('Failed to save subtasks');
						}

						// Update the task with subtasks relation
						savedTask.subtasks = savedSubtasks;
						await this.taskRepository.save(savedTask);
					} catch (error) {
						throw new Error(`Failed to create subtasks: ${error.message}`);
					}
				}

				// Create recurring tasks if repetition is specified
				if (createTaskDto.repetitionType && createTaskDto.repetitionType !== RepetitionType.NONE) {
					await this.createRepeatingTasks(savedTask, createTaskDto);
				}

				// Send notifications to assignees
				if (assignees.length > 0) {
					const assigneeUsers = await this.userRepository.find({
						where: { uid: In(assignees.map((a) => a?.uid)) },
						select: ['uid', 'email', 'name', 'surname'],
					});

					// Create notification object
					const notification = {
						type: NotificationType.USER,
						title: 'New Task Assigned',
						message: `You have been assigned a new task: "${savedTask?.title}"`,
						status: NotificationStatus.UNREAD,
						metadata: {
							taskId: savedTask?.uid,
							priority: savedTask?.priority,
							deadline: savedTask?.deadline,
							assignedBy: creator ? `${creator?.name} ${creator?.surname}` : 'System',
							createdAt: savedTask?.createdAt,
						},
					};

					// Send system notification to each assignee
					for (const assignee of assigneeUsers) {
						// Send system notification
						this.eventEmitter.emit(
							'send.notification',
							{
								...notification,
								owner: { uid: assignee?.uid },
							},
							[assignee.uid],
						);

						// Send email notification
						await this.communicationService.sendEmail(EmailType.NEW_TASK, [assignee.email], {
							name: `${assignee?.name} ${assignee?.surname}`,
							taskId: savedTask?.uid?.toString(),
							title: savedTask?.title,
							description: savedTask?.description,
							deadline: savedTask?.deadline?.toISOString(),
							priority: savedTask?.priority,
							taskType: savedTask?.taskType,
							status: savedTask?.status,
							assignedBy: creator ? `${creator?.name} ${creator?.surname}` : 'System',
							subtasks: [],
							clients: clients.length > 0 ? await this.getClientNames(clients.map((c) => c?.uid)) : [],
							attachments: savedTask.attachments?.map((attachment) => ({
								name: attachment,
								url: attachment,
							})),
						});
					}
				}

				// Clear cache
				await this.clearTaskCache();

				return {
					message: process.env.SUCCESS_MESSAGE,
				};
			} catch (error) {
				return error;
			}
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	private async populateTaskRelations(task: Task): Promise<Task> {
		if (task.assignees?.length > 0) {
			const assigneeIds = task.assignees.map((a) => a.uid);
			const assigneeProfiles = await this.userRepository.find({
				where: { uid: In(assigneeIds) },
				select: ['uid', 'username', 'name', 'surname', 'email', 'phone', 'photoURL', 'accessLevel', 'status'],
			});
			task.assignees = assigneeProfiles;
		}

		if (task.clients?.length > 0) {
			const clientIds = task.clients.map((c) => c.uid);
			const clientProfiles = await this.clientRepository.find({
				where: { uid: In(clientIds) },
			});
			task.clients = clientProfiles;
		}

		return task;
	}

	async findOne(ref: number): Promise<{ message: string; task: Task | null }> {
		try {
			const cacheKey = this.getCacheKey(ref);
			const cachedTask = await this.cacheManager.get<Task>(cacheKey);

			if (cachedTask) {
				return {
					task: cachedTask,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			const task = await this.taskRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false,
				},
				relations: ['creator', 'subtasks', 'organisation', 'branch', 'routes'],
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const populatedTask = await this.populateTaskRelations(task);

			await this.cacheManager.set(cacheKey, populatedTask, this.CACHE_TTL);

			return {
				task: populatedTask,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				task: null,
				message: error?.message,
			};
		}
	}

	public async tasksByUser(ref: number): Promise<{ message: string; tasks: Task[] }> {
		try {
			const tasks = await this.taskRepository.find({
				where: { creator: { uid: ref }, isDeleted: false },
				relations: ['creator', 'subtasks', 'organisation', 'branch', 'routes'],
			});

			if (!tasks) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const populatedTasks = await Promise.all(tasks.map((task) => this.populateTaskRelations(task)));

			return {
				message: process.env.SUCCESS_MESSAGE,
				tasks: populatedTasks,
			};
		} catch (error) {
			return {
				message: `could not get tasks by user - ${error?.message}`,
				tasks: null,
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
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
	): Promise<PaginatedResponse<Task>> {
		try {
			const cacheKey = `tasks_page${page}_limit${limit}_${JSON.stringify(filters)}`;
			const cachedTasks = await this.cacheManager.get<PaginatedResponse<Task>>(cacheKey);

			if (cachedTasks) {
				return cachedTasks;
			}

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
				skip: (page - 1) * limit,
				relations: ['creator', 'subtasks', 'organisation', 'branch', 'routes'],
				take: limit,
				order: {
					createdAt: 'DESC',
				},
			});

			let filteredTasks = await Promise.all(tasks.map((task) => this.populateTaskRelations(task)));

			// Apply post-query filters that can't be done in the database
			if (filters?.assigneeId) {
				filteredTasks = filteredTasks?.filter((task) =>
					task.assignees?.some((assignee) => assignee.uid === filters?.assigneeId),
				);
			}

			if (filters?.clientId) {
				filteredTasks = filteredTasks?.filter((task) =>
					task.clients?.some((client) => client.uid === filters?.clientId),
				);
			}

			const response = {
				data: filteredTasks,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
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

	async update(ref: number, updateTaskDto: UpdateTaskDto): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false,
				},
				relations: ['subtasks'], // Include subtasks relation
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const taskData: DeepPartial<Task> = {
				...updateTaskDto,
			};

			// Handle assignees
			if (updateTaskDto?.assignees) {
				taskData.assignees = updateTaskDto.assignees.map((assignee) => ({
					uid: assignee.uid,
				}));
			}

			// Handle clients
			if (updateTaskDto?.client) {
				taskData.clients = updateTaskDto.client.map((client) => ({
					uid: client.uid,
				}));
			}

			// Handle creator
			if (updateTaskDto?.creators) {
				taskData.creator = { uid: updateTaskDto.creators[0].uid };
			}

			// Save the updated task
			const entityToSave = this.taskRepository.create({
				...task,
				...taskData,
			});

			const savedTask = await this.taskRepository.save(entityToSave);

			// Handle subtasks if they exist in the DTO
			if (updateTaskDto.subtasks?.length > 0) {
				// Delete existing subtasks
				if (task.subtasks?.length > 0) {
					await this.subtaskRepository.delete({ task: { uid: ref } });
				}

				// Create new subtasks
				const subtasks = updateTaskDto.subtasks.map((subtask) =>
					this.subtaskRepository.create({
						title: subtask.title,
						description: subtask.description,
						status: subtask.status || SubTaskStatus.PENDING,
						task: savedTask,
						isDeleted: false,
					}),
				);
				await this.subtaskRepository.save(subtasks);
			}

			// Clear all task-related caches
			await this.clearTaskCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async remove(ref: number): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: {
					uid: ref,
				},
				relations: ['subtasks'], // Include subtasks relation
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Soft delete all subtasks
			if (task.subtasks?.length > 0) {
				await this.subtaskRepository.update({ task: { uid: ref } }, { isDeleted: true });
			}

			// Soft delete the task
			await this.taskRepository.update(ref, { isDeleted: true });

			// Clear all task-related caches
			await this.clearTaskCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
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
					deadline: Between(startOfDay, endOfDay),
				},
			});

			const byStatus: Record<TaskStatus, number> = {
				[TaskStatus.PENDING]: 0,
				[TaskStatus.IN_PROGRESS]: 0,
				[TaskStatus.COMPLETED]: 0,
				[TaskStatus.CANCELLED]: 0,
				[TaskStatus.OVERDUE]: 0,
				[TaskStatus.POSTPONED]: 0,
				[TaskStatus.MISSED]: 0,
			};

			tasks.forEach((task) => {
				if (task.status) byStatus[task.status]++;
			});

			return {
				byStatus,
				total: tasks.length,
			};
		} catch (error) {
			return {
				byStatus: Object.values(TaskStatus).reduce(
					(acc, status) => ({ ...acc, [status]: 0 }),
					{} as Record<TaskStatus, number>,
				),
				total: 0,
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
				},
				relations: ['subtasks'],
			});

			return { total: tasks };
		} catch (error) {
			return { total: 0 };
		}
	}

	async findOneSubTask(ref: number): Promise<{ tasks: SubTask | null; message: string }> {
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
				tasks: null,
			};
		}
	}

	private async getParentTaskId(subtaskId: number): Promise<number | null> {
		try {
			const subtask = await this.subtaskRepository.findOne({
				where: { uid: subtaskId },
				relations: ['task'],
			});
			return subtask?.task?.uid || null;
		} catch (error) {
			return null;
		}
	}

	async updateSubTask(ref: number, updateSubTaskDto: UpdateSubtaskDto): Promise<{ message: string }> {
		try {
			// Update the subtask
			await this.subtaskRepository.update(ref, updateSubTaskDto);

			// Get parent task ID and clear cache
			const parentTaskId = await this.getParentTaskId(ref);
			if (parentTaskId) {
				await this.clearTaskCache(parentTaskId);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async deleteSubTask(ref: number): Promise<{ message: string }> {
		try {
			// Get parent task ID before deletion
			const parentTaskId = await this.getParentTaskId(ref);

			// Delete the subtask
			await this.subtaskRepository.delete(ref);

			// Clear cache if we found the parent task
			if (parentTaskId) {
				await this.clearTaskCache(parentTaskId);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async completeSubTask(ref: number): Promise<{ message: string }> {
		try {
			// Update the subtask status
			await this.subtaskRepository.update(ref, { status: SubTaskStatus.COMPLETED });

			// Get parent task ID and clear cache
			const parentTaskId = await this.getParentTaskId(ref);
			if (parentTaskId) {
				await this.clearTaskCache(parentTaskId);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async updateProgress(ref: number, progress: number): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: { uid: ref },
				relations: ['assignees', 'createdBy'],
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
					owner: null,
				};

				const recipients = [task.creator[0]?.uid, ...(task.assignees?.map((assignee) => assignee.uid) || [])];

				const uniqueRecipients = [...new Set(recipients)];
				uniqueRecipients.forEach((recipientId) => {
					this.eventEmitter.emit(
						'send.notification',
						{
							...notification,
							owner: { uid: recipientId },
							metadata: {
								taskId: task.uid,
								completedAt: new Date(),
							},
						},
						[recipientId],
					);
				});
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			throw new BadRequestException(error?.message);
		}
	}

	private async populateTasksForAnalytics(tasks: Task[]): Promise<Task[]> {
		return Promise.all(tasks.map((task) => this.populateTaskRelations(task)));
	}

	async getTasksReport(filter: any) {
		try {
			const tasks = await this.taskRepository.find({
				where: {
					...filter,
					isDeleted: false,
				},
				relations: ['creator', 'subtasks', 'organisation', 'branch'],
			});

			if (!tasks) {
				throw new NotFoundException('No tasks found for the specified period');
			}

			const populatedTasks = await this.populateTasksForAnalytics(tasks);

			const groupedTasks = {
				pending: populatedTasks.filter((task) => task.status === TaskStatus.PENDING),
				inProgress: populatedTasks.filter((task) => task.status === TaskStatus.IN_PROGRESS),
				completed: populatedTasks.filter((task) => task.status === TaskStatus.COMPLETED),
				overdue: populatedTasks.filter((task) => task.status === TaskStatus.OVERDUE),
			};

			const totalTasks = populatedTasks.length;
			const completedTasks = groupedTasks.completed.length;
			const avgCompletionTime = this.calculateAverageCompletionTime(populatedTasks);
			const overdueRate = this.calculateOverdueRate(populatedTasks);
			const taskDistribution = this.analyzeTaskDistribution(populatedTasks);
			const incompletionReasons = this.analyzeIncompletionReasons(populatedTasks);
			const clientCompletionRates = await this.analyzeClientCompletionRates(populatedTasks);
			const taskPriorityDistribution = this.analyzeTaskPriorityDistribution(populatedTasks);
			const assigneePerformance = await this.analyzeAssigneePerformance(populatedTasks);

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
					assigneePerformance,
				},
			};
		} catch (error) {
			return null;
		}
	}

	private calculateAverageCompletionTime(tasks: Task[]): number {
		const completedTasks = tasks.filter((task) => task.status === TaskStatus.COMPLETED && task.completionDate);

		if (completedTasks.length === 0) return 0;

		const totalCompletionTime = completedTasks.reduce((sum, task) => {
			const completionTime = task.completionDate.getTime() - task.createdAt.getTime();
			return sum + completionTime;
		}, 0);

		// Convert from milliseconds to hours
		return Number((totalCompletionTime / (completedTasks.length * 60 * 60 * 1000)).toFixed(1));
	}

	private calculateOverdueRate(tasks: Task[]): number {
		if (tasks.length === 0) return 0;
		const overdueTasks = tasks.filter((task) => task.isOverdue || task.status === TaskStatus.OVERDUE).length;
		return Number(((overdueTasks / tasks.length) * 100).toFixed(1));
	}

	private analyzeTaskDistribution(tasks: Task[]): Record<TaskType, number> {
		const distribution: Record<TaskType, number> = Object.values(TaskType).reduce((acc, type) => {
			acc[type] = 0;
			return acc;
		}, {} as Record<TaskType, number>);

		tasks.forEach((task) => {
			distribution[task.taskType] = (distribution[task.taskType] || 0) + 1;
		});
		return distribution;
	}

	private analyzeIncompletionReasons(tasks: Task[]): Array<{ reason: string; count: number }> {
		const reasons: Record<string, number> = {};
		tasks.forEach((task) => {
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
			if (!task.completionDate) return 'Never Started';
			if (task.progress < 50) return 'Insufficient Progress';
			return 'Incomplete Work';
		}
		return 'Other';
	}

	private analyzeClientCompletionRates(tasks: Task[]): Array<{
		clientId: number;
		totalTasks: number;
		completedTasks: number;
		completionRate: string;
	}> {
		const clientStats: Record<
			number,
			{
				totalTasks: number;
				completedTasks: number;
			}
		> = {};

		tasks.forEach((task) => {
			task.clients?.forEach((client) => {
				if (!clientStats[client.uid]) {
					clientStats[client.uid] = {
						totalTasks: 0,
						completedTasks: 0,
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
			totalTasks: stats.totalTasks,
			completedTasks: stats.completedTasks,
			completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`,
		}));
	}

	private analyzeTaskPriorityDistribution(tasks: Task[]): Record<TaskPriority, number> {
		const distribution: Record<TaskPriority, number> = Object.values(TaskPriority).reduce((acc, priority) => {
			acc[priority] = 0;
			return acc;
		}, {} as Record<TaskPriority, number>);

		tasks.forEach((task) => {
			distribution[task.priority] = (distribution[task.priority] || 0) + 1;
		});
		return distribution;
	}

	private analyzeAssigneePerformance(tasks: Task[]): Array<{
		assigneeId: number;
		totalTasks: number;
		completedTasks: number;
		completionRate: string;
		averageCompletionTime: string;
	}> {
		const assigneeStats: Record<
			number,
			{
				totalTasks: number;
				completedTasks: number;
				totalCompletionTime: number;
			}
		> = {};

		tasks.forEach((task) => {
			task.assignees?.forEach((assignee) => {
				if (!assigneeStats[assignee.uid]) {
					assigneeStats[assignee.uid] = {
						totalTasks: 0,
						completedTasks: 0,
						totalCompletionTime: 0,
					};
				}
				assigneeStats[assignee.uid].totalTasks++;
				if (task.status === TaskStatus.COMPLETED && task.completionDate) {
					assigneeStats[assignee.uid].completedTasks++;
					assigneeStats[assignee.uid].totalCompletionTime +=
						new Date(task.completionDate).getTime() - new Date(task.createdAt).getTime();
				}
			});
		});

		return Object.entries(assigneeStats).map(([assigneeId, stats]) => ({
			assigneeId: parseInt(assigneeId),
			totalTasks: stats.totalTasks,
			completedTasks: stats.completedTasks,
			completionRate: `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`,
			averageCompletionTime:
				stats.completedTasks > 0
					? `${Math.round(stats.totalCompletionTime / stats.completedTasks / (1000 * 60 * 60))} hours`
					: 'N/A',
		}));
	}

	// Helper method to get client names
	private async getClientNames(clientIds: number[]): Promise<Array<{ name: string }>> {
		const clients = await this.clientRepository.find({
			where: { uid: In(clientIds) },
			select: ['name'],
		});
		return clients.map((client) => ({ name: client.name }));
	}
}
