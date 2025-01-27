import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Between } from 'typeorm';
import { NotificationType } from '../lib/enums/notification.enums';
import { NotificationStatus } from '../lib/enums/notification.enums';
import { SubTaskStatus } from '../lib/enums/status.enums';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES } from '../lib/constants/constants';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus, RepetitionType, TaskType } from '../lib/enums/task.enums';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(SubTask)
		private subtaskRepository: Repository<SubTask>,
		private readonly eventEmitter: EventEmitter2,
		private readonly rewardsService: RewardsService
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
			repeatedTask.progress = 0;
			repeatedTask.attachments = createTaskDto.attachments;
			repeatedTask.branch = baseTask.branch;
			repeatedTask.lastCompletedAt = null;
			repeatedTask.repetitionType = RepetitionType.NONE;
			repeatedTask.repetitionEndDate = null;
			repeatedTask.createdBy = baseTask.createdBy;

			await this.taskRepository.save(repeatedTask);
			console.log(`Created repeating task for ${nextDate}`);

			currentDate = nextDate;
			tasksCreated++;
		}
	}

	async create(createTaskDto: CreateTaskDto): Promise<{ message: string }> {
		try {
			const assignees = createTaskDto?.assigneeIds?.map(assignee => ({ uid: assignee }));
			const clients = createTaskDto?.clientIds?.map(clientId => ({ uid: clientId }));

			const task = await this.taskRepository.save({
				...createTaskDto,
				assignees: assignees,
				clients: clients
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Create future instances if task is repeating
			await this.createRepeatingTasks(task, createTaskDto);

			if (createTaskDto?.subtasks && createTaskDto?.subtasks?.length > 0) {
				const subtasks = createTaskDto?.subtasks?.map(subtask => ({
					...subtask,
					task: { uid: task?.uid }
				}));

				await this.subtaskRepository.save(subtasks);
			}

			// Send notification to assignees
			if (assignees?.length > 0) {
				const notification = {
					type: NotificationType.USER,
					title: 'New Task Assigned',
					message: `You have been assigned to a new task: ${task?.title}`,
					status: NotificationStatus.UNREAD,
					owner: null
				};

				// Send to each assignee
				assignees?.forEach(assignee => {
					this.eventEmitter.emit('send.notification', {
						...notification,
						owner: assignee
					}, [assignee.uid]);
				});
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findAll(): Promise<{ tasks: Task[] | null, message: string }> {
		try {
			const tasks = await this.taskRepository.find({
				where: { isDeleted: false },
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
				branch: updateTaskDto.branch,
				priority: updateTaskDto.priority,
				progress: updateTaskDto.progress,
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
}
