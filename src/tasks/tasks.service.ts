import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) { }

  create(createTaskDto: CreateTaskDto) {
    return 'This action adds a new task';
  }

  findAll() {
    return `This action returns all tasks`;
  }

  findOne(referenceCode: string) {
    return `This action returns a #${referenceCode} task`;
  }

  update(referenceCode: string, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${referenceCode} task`;
  }

  remove(referenceCode: string) {
    return `This action removes a #${referenceCode} task`;
  }
}
