import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { UserModule } from 'src/user/user.module';
import { RewardsModule } from 'src/rewards/rewards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), UserModule, RewardsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule { }
