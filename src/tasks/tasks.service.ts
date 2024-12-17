import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubTask, Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccessLevel, NotificationStatus, NotificationType, Status } from '../lib/enums/enums';
import { Between } from 'typeorm';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(SubTask)
		private subTaskRepository: Repository<SubTask>,
		private readonly eventEmitter: EventEmitter2
	) { }

	async create(createTaskDto: CreateTaskDto): Promise<{ message: string }> {
		try {
			// Convert assignees array to proper format
			const assignees = createTaskDto?.assignees?.map(assignee => ({ uid: assignee?.uid }));

			// Create task entity with properly formatted assignees
			const task = await this.taskRepository.save({
				...createTaskDto,
				assignees: assignees
			});

			if (!task) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const notification = {
				type: NotificationType.USER,
				title: 'Task Created',
				message: `A task has been created`,
				status: NotificationStatus.UNREAD,
				owner: task?.owner
			}

			const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]
			this.eventEmitter.emit('send.notification', notification, recipients);

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
					'owner',
					'branch',
					'subtasks',
					'client',
				]
			});

			if (!tasks) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
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
					'owner',
					'branch',
					'subtasks',
					'client',
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
				where: { owner: { uid: ref }, isDeleted: false },
				relations: [
					'owner',
					'branch',
					'subtasks',
					'client',
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

	public async subtasksByTask(ref: number): Promise<{ message: string, tasks: SubTask }> {
		try {
			const tasks = await this.subTaskRepository.findOne({
				where: { task: { uid: ref } },
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
				message: `could not get subtasks by task - ${error?.message}`,
				tasks: null
			}

			return response;
		}
	}

	async update(ref: number, updateTaskDto: UpdateTaskDto): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.findOne({
				where: { uid: ref, isDeleted: false },
				relations: ['assignees']
			});

			if (!task) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			// Create an object with all possible updateable fields except assignees
			const updateData = {
				comment: updateTaskDto.comment,
				notes: updateTaskDto.notes,
				description: updateTaskDto.description,
				status: updateTaskDto.status,
				owner: updateTaskDto.owner,
				taskType: updateTaskDto.taskType,
				deadline: updateTaskDto.deadline,
				branch: updateTaskDto.branch,
				priority: updateTaskDto.priority,
				progress: updateTaskDto.progress,
				subtasks: updateTaskDto.subtasks?.map(subtask => ({
					title: subtask.title,
					description: subtask.description,
					order: subtask.order,
					assignee: subtask.assignee
				})),
				repetitionType: updateTaskDto.repetitionType,
				repetitionEndDate: updateTaskDto.repetitionEndDate,
				attachments: updateTaskDto.attachments
			};

			// Remove undefined properties
			Object.keys(updateData).forEach(key =>
				updateData[key] === undefined && delete updateData[key]
			);

			// First update the basic fields
			await this.taskRepository.update({ uid: ref }, updateData);

			// If assignees are provided, handle the many-to-many relationship separately
			if (updateTaskDto.assignees) {
				// Get the task again with manager to handle relations
				const taskToUpdate = await this.taskRepository.manager.findOne(Task, {
					where: { uid: ref },
					relations: ['assignees']
				});

				// Clear existing assignees and set new ones
				taskToUpdate.assignees = updateTaskDto.assignees.map(assignee => ({ uid: assignee.uid } as any));
				await this.taskRepository.manager.save(taskToUpdate);
			}

			const notification = {
				type: NotificationType.USER,
				title: 'Task Updated',
				message: `A task has been updated`,
				status: NotificationStatus.UNREAD,
				owner: task.owner
			}

			const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]
			this.eventEmitter.emit('send.notification', notification, recipients);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			console.error('Update error:', error);
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
				throw new Error(process.env.NOT_FOUND_MESSAGE);
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
		byStatus: Record<Status, number>;
		total: number;
	}> {
		try {
			const tasks = await this.taskRepository.find({
				where: { isDeleted: false }
			});

			const byStatus: Record<Status, number> = {
				[Status.POSTPONED]: 0,
				[Status.MISSED]: 0,
				[Status.COMPLETED]: 0,
				[Status.CANCELLED]: 0,
				[Status.PENDING]: 0,
				[Status.INPROGRESS]: 0,
				[Status.APPROVED]: 0,
				[Status.REVIEW]: 0,
				[Status.DECLINED]: 0,
				// Initialize other Status enum values to 0
				[Status.ACTIVE]: 0,
				[Status.INACTIVE]: 0,
				[Status.DELETED]: 0,
				[Status.BANNED]: 0,
				[Status.DEACTIVATED]: 0,
				[Status.EXPIRED]: 0,
				[Status.PAID]: 0,
				[Status.UNPAID]: 0,
				[Status.PARTIAL]: 0,
				[Status.OVERDUE]: 0,
				[Status.DRIVING]: 0,
				[Status.PARKING]: 0,
				[Status.STOPPED]: 0
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
				byStatus: Object.values(Status).reduce((acc, status) => ({ ...acc, [status]: 0 }), {} as Record<Status, number>),
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
					createdAt: Between(startOfDay, endOfDay)
				}
			});

			return { total: tasks };
		} catch (error) {
			return { total: 0 };
		}
	}
}
