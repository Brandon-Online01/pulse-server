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
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { CommunicationModule } from '../communication/communication.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TaskReminderService } from './task-reminder.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Task, SubTask, Client, User, Organisation, Branch]),
    RewardsModule,
    ConfigModule,
    CommunicationModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskReminderService],
  exports: [TasksService]
})
export class TasksModule { }
