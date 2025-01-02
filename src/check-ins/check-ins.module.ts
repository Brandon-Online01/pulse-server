import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { CheckIn } from './entities/check-in.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn]), RewardsModule],
  controllers: [CheckInsController],
  providers: [CheckInsService],
  exports: [CheckInsService]
})
export class CheckInsModule { }
