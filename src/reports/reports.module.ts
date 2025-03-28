import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../organisation/entities/organisation.entity';
import { LicensingModule } from '../licensing/licensing.module';
import { Branch } from '../branch/entities/branch.entity';
import { User } from '../user/entities/user.entity';
import { Report } from './entities/report.entity';
import { MainReportGenerator } from './generators/main-report.generator';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Journal } from '../journal/entities/journal.entity';
import { Task } from '../tasks/entities/task.entity';
import { News } from '../news/entities/news.entity';
import { Asset } from '../assets/entities/asset.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { Doc } from '../docs/entities/doc.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		LicensingModule,
		ConfigModule,
		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				// Ensure TTL is a positive number
				const ttl = Math.max(0, parseInt(configService.get('CACHE_EXPIRATION_TIME', '300'), 10));

				// Ensure max is a non-negative integer
				const max = Math.max(0, parseInt(configService.get('CACHE_MAX_ITEMS', '100'), 10));

				return {
					ttl,
					max,
				};
			},
			inject: [ConfigService],
		}),
		TypeOrmModule.forFeature([
			Organisation,
			Branch,
			User,
			Report,
			Attendance,
			Claim,
			Lead,
			Journal,
			Task,
			News,
			Asset,
			Client,
			Product,
			CheckIn,
			Doc,
			Notification,
		]),
	],
	controllers: [ReportsController],
	providers: [ReportsService, MainReportGenerator],
	exports: [ReportsService],
})
export class ReportsModule {}
