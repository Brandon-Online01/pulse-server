import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
	imports: [LicensingModule, TypeOrmModule.forFeature([Attendance]), UserModule, RewardsModule],
	controllers: [AttendanceController],
	providers: [AttendanceService],
	exports: [AttendanceService],
})
export class AttendanceModule {}
