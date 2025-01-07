import { Module } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Claim]),
    RewardsModule
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService]
})
export class ClaimsModule { }
