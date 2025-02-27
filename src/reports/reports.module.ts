import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { LeadsModule } from '../leads/leads.module';
import { JournalModule } from '../journal/journal.module';
import { ClaimsModule } from '../claims/claims.module';
import { TasksModule } from '../tasks/tasks.module';
import { ShopModule } from '../shop/shop.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { NewsModule } from '../news/news.module';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';
import { CheckInsModule } from '../check-ins/check-ins.module';
import { TrackingModule } from '../tracking/tracking.module';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { Task } from '../tasks/entities/task.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Lead } from '../leads/entities/lead.entity';
import { ConfigModule } from '@nestjs/config';
import { LicensingModule } from '../licensing/licensing.module';
import { Journal } from '../journal/entities/journal.entity';
import { User } from '../user/entities/user.entity';
import { Achievement } from '../rewards/entities/achievement.entity';
import { Client } from '../clients/entities/client.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { CommunicationModule } from '../communication/communication.module';
import { Tracking } from '../tracking/entities/tracking.entity';
import { LiveUserReportService } from './live-user-report.service';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([
      Report,
      CheckIn,
      Task,
      Claim,
      Lead,
      Journal,
      User,
      Achievement,
      Client,
      Attendance,
      Organisation,
      Branch,
      Tracking
    ]),
    LeadsModule,
    JournalModule,
    ClaimsModule,
    TasksModule,
    ShopModule,
    AttendanceModule,
    NewsModule,
    UserModule,
    RewardsModule,
    CheckInsModule,
    TrackingModule,
    ConfigModule,
    CommunicationModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService, LiveUserReportService],
  exports: [ReportsService, LiveUserReportService]
})
export class ReportsModule { }
