import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Attendance } from './entities/attendance.entity';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from '../licensing/licensing.module';
import { OrganisationHours } from '../organisation/entities/organisation-hours.entity';
import { OrganizationHoursService } from './services/organization-hours.service';
import { AttendanceCalculatorService } from './services/attendance-calculator.service';
import { AttendanceReportsService } from './services/attendance-reports.service';

@Module({
	imports: [
		LicensingModule,
		TypeOrmModule.forFeature([Attendance, User, Organisation, OrganisationHours]),
		UserModule,
		RewardsModule,
		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				const ttl = configService.get<number>('CACHE_EXPIRATION_TIME', 30) * 1000;
				const maxItems = parseInt(configService.get('CACHE_MAX_ITEMS', '100'), 10);
				return {
					ttl,
					max: isNaN(maxItems) || maxItems <= 0 ? 100 : maxItems,
				};
			},
			inject: [ConfigService],
		}),
	],
	controllers: [AttendanceController],
	providers: [AttendanceService, OrganizationHoursService, AttendanceCalculatorService, AttendanceReportsService],
	exports: [AttendanceService, OrganizationHoursService, AttendanceCalculatorService, AttendanceReportsService],
})
export class AttendanceModule {}
