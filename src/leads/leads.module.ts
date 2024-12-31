import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead } from './entities/lead.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsModule } from 'src/rewards/rewards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), RewardsModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule { }
