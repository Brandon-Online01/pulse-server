import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { Claim } from './entities/claim.entity';
import { CurrencyService } from './utils/currency.service';
import { ClaimStatsService } from './utils/stats.service';
import { ConfigModule } from '@nestjs/config';
import { RewardsModule } from '../rewards/rewards.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Claim]),
    ConfigModule,
    RewardsModule,
    LicensingModule,
    EventEmitterModule,
  ],
  controllers: [ClaimsController],
  providers: [
    ClaimsService,
    CurrencyService,
    ClaimStatsService,
  ],
  exports: [ClaimsService],
})
export class ClaimsModule { }
