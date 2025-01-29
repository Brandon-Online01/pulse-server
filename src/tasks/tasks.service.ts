import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Between } from 'typeorm';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../lib/enums/task.enums';
import { SubTaskStatus } from '../lib/enums/status.enums';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES } from '../lib/constants/constants';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { CreateTaskDto } from './dto/create-task.dto';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Client } from '../clients/entities/client.entity';
import { Not } from 'typeorm';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(SubTask)
		private subtaskRepository: Repository<SubTask>,
		private readonly eventEmitter: EventEmitter2,
		private readonly rewardsService: RewardsService,
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>
	) { }

	private async createRepeatingTasks(baseTask: Task, createTaskDto: CreateTaskDto): Promise<void> {
		if (!createTaskDto.repetitionType || createTaskDto.repetitionType === RepetitionType.NONE || !createTaskDto.deadline || !createTaskDto.repetitionEndDate) {
			return;
		}

		let currentDate = new Date(createTaskDto.deadline);
		const endDate = new Date(createTaskDto.repetitionEndDate);
		let tasksCreated = 0;

		while (currentDate < endDate) {
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

			// Skip if we've somehow gone past the end date
			if (nextDate > endDate) {
				break;
			}

			const repeatedTask = new Task();
			repeatedTask.title = `${createTaskDto.title} (${tasksCreated + 1} of ${createTaskDto.repetitionType})`;
			repeatedTask.description = createTaskDto.description;
			repeatedTask.deadline = nextDate;
			repeatedTask.assignees = baseTask.assignees;
			repeatedTask.clients = baseTask.clients;
			repeatedTask.status = TaskStatus.PENDING;
			repeatedTask.taskType = createTaskDto.taskType || TaskType.OTHER;
			repeatedTask.priority = createTaskDto.priority;
			repeatedTask.attachments = createTaskDto.attachments;
			repeatedTask.lastCompletedAt = null;
			repeatedTask.repetitionType = RepetitionType.NONE;
			repeatedTask.repetitionEndDate = null;
			repeatedTask.createdBy = baseTask.createdBy;

			await this.taskRepository.save(repeatedTask);

			currentDate = nextDate;
			tasksCreated++;
		}
	}

	async create(createTaskDto: CreateTaskDto): Promise<{ message: string }> {
		try {
			console.log(createTaskDto, 'createTaskDto')
			// Set default values and validate dates
			const now = new Date();
			if (createTaskDto.deadline && new Date(createTaskDto.deadline) < now) {
				throw new BadRequestException('Task deadline cannot be in the past');
			}

			if (createTaskDto.repetitionEndDate && new Date(createTaskDto.repetitionEndDate) < now) {
				throw new BadRequestException('Repetition end date cannot be in the past');
			}

			// Create base task data
			const taskData = {
				...createTaskDto,
				status: TaskStatus.PENDING,
				progress: 0,
				assignees: createTaskDto.assignees || [],
				clients: [],
				attachments: []
			};

			// Handle client assignments
			const clientUids = new Set();

			// Case 1: Specific client selected
			if (createTaskDto.client?.uid) {
				clientUids.add(createTaskDto.client.uid);
			}

			// Case 2: Target category specified
			if (createTaskDto.targetCategory) {
				const categoryClients = await this.clientRepository.find({
					where: {
						category: createTaskDto.targetCategory,
						isDeleted: false
					},
					select: ['uid']
				});

				categoryClients.forEach(client => clientUids.add(client.uid));
			}

			// Convert client UIDs to the correct format for ManyToMany relationship
			if (clientUids.size > 0) {
				taskData.clients = Array.from(clientUids).map(uid => ({ uid }));
			}

			console.log(taskData, 'taskData')

			const task = await this.taskRepository.save(taskData);

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Create future instances if task is repeating
			if (createTaskDto.repetitionType !== RepetitionType.NONE) {
				await this.createRepeatingTasks(task, createTaskDto);
			}

			// Create subtasks if provided
			if (createTaskDto?.subtasks?.length > 0) {
				const subtasks = createTaskDto.subtasks.map(subtask => ({
					...subtask,
					task: { uid: task.uid },
					status: SubTaskStatus.PENDING
				}));

				await this.subtaskRepository.save(subtasks);
			}

			// Send notifications to assignees
			if (taskData.assignees?.length > 0) {
				const notification = {
					type: NotificationType.USER,
					title: 'New Task Assignment',
					message: `You have been assigned to: ${task.title}`,
					status: NotificationStatus.UNREAD,
					owner: null
				};

				taskData.assignees.forEach(assignee => {
					this.eventEmitter.emit('send.notification', {
						...notification,
						owner: assignee,
						metadata: {
							taskId: task.uid,
							deadline: task.deadline,
							priority: task.priority
						}
					}, [assignee.uid]);
				});
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			throw new BadRequestException(error?.message);
		}
	}

	async findAll(filters?: {
		status?: TaskStatus;
		priority?: TaskPriority;
		assigneeId?: number;
		clientId?: number;
		startDate?: Date;
		endDate?: Date;
		isOverdue?: boolean;
	}): Promise<{ tasks: Task[] | null, message: string }> {
		try {
			const queryBuilder = this.taskRepository
				.createQueryBuilder('task')
				.leftJoinAndSelect('task.createdBy', 'createdBy')
				.leftJoinAndSelect('task.assignees', 'assignees')
				.leftJoinAndSelect('task.clients', 'clients')
				.leftJoinAndSelect('task.subtasks', 'subtasks')
				.where('task.isDeleted = :isDeleted', { isDeleted: false });

			if (filters?.status) {
				queryBuilder.andWhere('task.status = :status', { status: filters.status });
			}

			if (filters?.priority) {
				queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
			}

			if (filters?.assigneeId) {
				queryBuilder.andWhere('assignees.uid = :assigneeId', { assigneeId: filters.assigneeId });
			}

			if (filters?.clientId) {
				queryBuilder.andWhere('clients.uid = :clientId', { clientId: filters.clientId });
			}

			if (filters?.startDate && filters?.endDate) {
				queryBuilder.andWhere('task.deadline BETWEEN :startDate AND :endDate', {
					startDate: filters.startDate,
					endDate: filters.endDate
				});
			}

			if (filters?.isOverdue !== undefined) {
				queryBuilder.andWhere('task.isOverdue = :isOverdue', { isOverdue: filters.isOverdue });
			}

			const tasks = await queryBuilder.getMany();

			if (!tasks) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				tasks,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				tasks: null
			};
		}
	}

	async findOne(ref: number): Promise<{ task: Task | null, message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: { uid: ref, isDeleted: false },
				relations: [
					'createdBy',
					'branch',
					'clients',
					'subtasks',
					'assignees'
				]
			});

			if (!task) {
				return {
					task: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			return {
				task,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				task: null
			};
		}
	}

	public async tasksByUser(ref: number): Promise<{ message: string, tasks: Task[] }> {
		try {
			const tasks = await this.taskRepository.find({
				where: { createdBy: { uid: ref }, isDeleted: false },
				relations: [
					'createdBy',
					'branch',
					'clients',
					'subtasks',
					'assignees'
				]
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
				where: { uid: ref, isDeleted: false },
				relations: ['assignees', 'subtasks', 'createdBy']
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Create an object with all possible updateable fields except assignees and subtasks
			const updateData = {
				title: updateTaskDto.title,
				description: updateTaskDto.description,
				status: updateTaskDto.status,
				taskType: updateTaskDto.taskType,
				deadline: updateTaskDto.deadline,
				priority: updateTaskDto.priority,
				repetitionType: updateTaskDto.repetitionType,
				repetitionEndDate: updateTaskDto.repetitionEndDate,
				attachments: updateTaskDto.attachments,
			};

			Object.keys(updateData).forEach(key =>
				updateData[key] === undefined && delete updateData[key]
			);

			if (Object.keys(updateData).length > 0) {
				await this.taskRepository.update({ uid: ref }, updateData);
			}

			if (updateTaskDto.assignees) {
				const taskToUpdate = await this.taskRepository.manager.findOne(Task, {
					where: { uid: ref },
					relations: ['assignees']
				});
				taskToUpdate.assignees = updateTaskDto.assignees.map(assignee => ({ uid: assignee.uid } as any));
				await this.taskRepository.manager.save(taskToUpdate);
			}

			if (updateTaskDto.subtasks) {
				await this.subtaskRepository.delete({ task: { uid: ref } });

				if (updateTaskDto.subtasks.length > 0) {
					const subtasks = updateTaskDto.subtasks.map(subtask => ({
						...subtask,
						task: { uid: ref }
					}));
					await this.subtaskRepository.save(subtasks);
				}
			}

			// Send notification to task creator and assignees
			const notification = {
				type: NotificationType.USER,
				title: 'Task Updated',
				message: `Task "${task.title}" has been updated`,
				status: NotificationStatus.UNREAD,
				owner: null
			};

			// Get all users who should receive the notification
			const recipientIds = [
				task.createdBy.uid,
				...(task.assignees?.map(assignee => assignee.uid) || [])
			];

			// Remove duplicates
			const uniqueRecipientIds = [...new Set(recipientIds)];

			// Send to each recipient
			uniqueRecipientIds.forEach(recipientId => {
				this.eventEmitter.emit('send.notification', {
					...notification,
					owner: { uid: recipientId }
				}, [recipientId]);
			});

			await this.rewardsService.awardXP({
				owner: task.createdBy.uid,
				amount: XP_VALUES.TASK,
				action: XP_VALUES_TYPES.TASK,
				source: {
					id: task.uid.toString(),
					type: XP_VALUES_TYPES.TASK,
					details: 'Task reward'
				}
			});

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
				where: { uid: ref, isDeleted: false }
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.taskRepository.update(
				{ uid: ref },
				{ isDeleted: true }
			);

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
			const startOfDay = new Date(date.setHours(0, 0, 0, 0));
			const endOfDay = new Date(date.setHours(23, 59, 59, 999));

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
					task.createdBy.uid,
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

	private getStatusSummary(tasks: Task[]): Record<TaskStatus, number> {
		const byStatus = {} as Record<TaskStatus, number>;

		// Initialize all status counts to 0
		Object.values(TaskStatus).forEach(status => {
			byStatus[status] = 0;
		});

		// Count tasks by status
		tasks.forEach(task => {
			byStatus[task.status]++;
		});

		return byStatus;
	}
}
