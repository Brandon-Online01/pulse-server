import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { JournalModule } from '../journal/journal.module';
import { TasksModule } from '../tasks/tasks.module';
import { NewsModule } from '../news/news.module';
import { AssetsModule } from '../assets/assets.module';
import { TrackingModule } from '../tracking/tracking.module';
import { LeadsModule } from '../leads/leads.module';
import { ClaimsModule } from '../claims/claims.module';
import { UserModule } from '../user/user.module';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [
    AttendanceModule,
    JournalModule,
    TasksModule,
    NewsModule,
    AssetsModule,
    TrackingModule,
    LeadsModule,
    ClaimsModule,
    NewsModule,
    AssetsModule,
    TrackingModule,
    LeadsModule,
    ClaimsModule,
    NewsModule,
    AssetsModule,
    TrackingModule,
    LeadsModule,
    ClaimsModule,
    UserModule,
    ShopModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule { }
