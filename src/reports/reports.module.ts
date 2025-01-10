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
import { LicensingModule } from '../licensing/licensing.module';
import { TrackingModule } from 'src/tracking/tracking.module';
import { BranchModule } from 'src/branch/branch.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Report]),
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
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule { }
