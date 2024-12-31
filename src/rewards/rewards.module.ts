import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { UserRewards } from './entities/user-rewards.entity';
import { Achievement } from './entities/achievement.entity';
import { XPTransaction } from './entities/xp-transaction.entity';
import { RewardsSubscriber } from './rewards.subscriber';
import { UnlockedItem } from './entities/unlocked-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRewards,
      Achievement,
      XPTransaction,
      UnlockedItem
    ])
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsSubscriber],
  exports: [RewardsService]
})
export class RewardsModule { }
