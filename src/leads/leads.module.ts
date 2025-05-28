import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead } from './entities/lead.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from 'src/licensing/licensing.module';
import { LeadsReminderService } from './leads-reminder.service';
import { LeadScoringService } from './lead-scoring.service';
import { User } from '../user/entities/user.entity';
import { Interaction } from '../interactions/entities/interaction.entity';
import { CommunicationModule } from '../communication/communication.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Lead, User, Interaction]),
    RewardsModule,
    CommunicationModule,
    NotificationsModule
  ],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsReminderService, LeadScoringService],
  exports: [LeadsService, LeadScoringService],
})
export class LeadsModule { }
