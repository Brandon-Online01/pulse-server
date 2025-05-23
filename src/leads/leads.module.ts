import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead } from './entities/lead.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from 'src/licensing/licensing.module';
import { LeadsReminderService } from './leads-reminder.service';
import { User } from '../user/entities/user.entity';
import { CommunicationModule } from '../communication/communication.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Lead, User]),
    RewardsModule,
    CommunicationModule,
    NotificationsModule
  ],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsReminderService],
  exports: [LeadsService],
})
export class LeadsModule { }
