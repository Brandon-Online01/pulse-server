import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTask } from './entities/subtask.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from '../licensing/licensing.module';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Task, SubTask, Client]),
    RewardsModule
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule { }
