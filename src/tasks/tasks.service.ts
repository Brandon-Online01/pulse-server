import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Claim } from 'src/claims/entities/claim.entity';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>
	) { }

	async create(createTaskDto: CreateTaskDto): Promise<{ message: string }> {
		try {
			const task = await this.taskRepository.save(createTaskDto);

			if (!task) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
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
				where: { isDeleted: false }
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
					'branch'
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
				where: { owner: { uid: ref } }
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
			await this.taskRepository.update(ref, updateTaskDto);

			const updatedTask = await this.taskRepository.findOne({
				where: { uid: ref, isDeleted: false }
			});

			if (!updatedTask) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
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
}
