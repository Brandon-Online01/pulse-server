import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { CheckIn } from './entities/check-in.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from '../licensing/licensing.module';
import { User } from '../user/entities/user.entity';
import { Client } from 'src/clients/entities/client.entity';

@Module({
	imports: [LicensingModule, TypeOrmModule.forFeature([CheckIn, User, Client]), RewardsModule],
	controllers: [CheckInsController],
	providers: [CheckInsService],
	exports: [CheckInsService],
})
export class CheckInsModule {}
