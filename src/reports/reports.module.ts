import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadsModule } from '../leads/leads.module';
import { JournalModule } from '../journal/journal.module';
import { ClaimsModule } from '../claims/claims.module';
import { TasksModule } from '../tasks/tasks.module';
import { ShopModule } from '../shop/shop.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { NewsModule } from '../news/news.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LeadsModule,
    JournalModule,
    ClaimsModule,
    TasksModule,
    ShopModule,
    AttendanceModule,
    NewsModule,
    UserModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule { }
