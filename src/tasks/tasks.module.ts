import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTask } from './entities/subtask.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from '../licensing/licensing.module';
import { Client } from '../clients/entities/client.entity';
import { User } from '../user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Task, SubTask, Client, User]),
    RewardsModule,
    ConfigModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule { }
