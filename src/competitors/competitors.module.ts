import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { CompetitorsService } from './competitors.service';
import { CompetitorsController } from './competitors.controller';
import { Competitor } from './entities/competitor.entity';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
	imports: [LicensingModule, TypeOrmModule.forFeature([Competitor]), CacheModule.register(), ConfigModule],
	controllers: [CompetitorsController],
	providers: [CompetitorsService],
	exports: [CompetitorsService],
})
export class CompetitorsModule {}
