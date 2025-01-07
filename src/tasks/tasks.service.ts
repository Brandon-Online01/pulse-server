import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Between } from 'typeorm';
import { NotificationType } from '../lib/enums/notification.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { NotificationStatus } from '../lib/enums/notification.enums';
import { SubTaskStatus, TaskStatus } from '../lib/enums/status.enums';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES } from '../lib/constants/constants';
import { XP_VALUES_TYPES } from '../lib/constants/constants';

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

	async create(createTaskDto: CreateTaskDto): Promise<{ message: string }> {
		try {
			const assignees = createTaskDto?.assignees?.map(assignee => ({ uid: assignee?.uid }));

			const task = await this.taskRepository.save({
				...createTaskDto,
				assignees: assignees
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			if (createTaskDto?.subtasks && createTaskDto?.subtasks?.length > 0) {

				const subtasks = createTaskDto?.subtasks?.map(subtask => ({
					...subtask,
					task: { uid: task?.uid }
				}));

				await this.subtaskRepository.save(subtasks);
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
					'client',
					'subtasks'
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
					'owner',
					'branch',
					'client',
					'subtasks'
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
					'client',
					'subtasks'
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
				relations: ['assignees', 'subtasks']
			});

			if (!task) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Create an object with all possible updateable fields except assignees and subtasks
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

			const notification = {
				type: NotificationType.USER,
				title: 'Task Updated',
				message: `A task has been updated`,
				status: NotificationStatus.UNREAD,
				owner: task.owner
			}

			const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]
			this.eventEmitter.emit('send.notification', notification, recipients);

			await this.rewardsService.awardXP({
				owner: task.owner.uid,
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
				[TaskStatus.POSTPONED]: 0,
				[TaskStatus.MISSED]: 0,
				[TaskStatus.COMPLETED]: 0,
				[TaskStatus.CANCELLED]: 0,
				[TaskStatus.PENDING]: 0,
				[TaskStatus.INPROGRESS]: 0
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
