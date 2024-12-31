import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UserRewards } from './entities/user-rewards.entity';
import { XPTransaction } from './entities/xp-transaction.entity';
import { LEVELS, RANKS } from '../lib/contants/constants';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(UserRewards)
    private userRewardsRepository: Repository<UserRewards>,
    @InjectRepository(XPTransaction)
    private xpTransactionRepository: Repository<XPTransaction>
  ) { }

  async awardXP(createRewardDto: CreateRewardDto) {
    try {

      console.log(createRewardDto);

      let userRewards = await this.userRewardsRepository.findOne({
        where: { owner: { uid: createRewardDto.owner } }
      });

      if (!userRewards) {
        userRewards = this.userRewardsRepository.create({
          owner: { uid: createRewardDto.owner },
          xpBreakdown: {
            tasks: 0,
            leads: 0,
            sales: 0,
            attendance: 0,
            collaboration: 0,
            other: 0
          }
        });
        userRewards = await this.userRewardsRepository.save(userRewards);
      }

      // Create XP transaction
      const transaction = this.xpTransactionRepository.create({
        userRewards,
        action: createRewardDto.action,
        xpAmount: createRewardDto.amount,
        metadata: {
          sourceId: createRewardDto.source.id,
          sourceType: createRewardDto.source.type,
          details: createRewardDto.source.details
        }
      });

      await this.xpTransactionRepository.save(transaction);

      // Update XP breakdown
      const category = this.mapSourceTypeToCategory(createRewardDto.source.type);
      userRewards.xpBreakdown[category] += createRewardDto.amount;
      userRewards.currentXP += createRewardDto.amount;
      userRewards.totalXP += createRewardDto.amount;

      // Check for level up
      const newLevel = this.calculateLevel(userRewards.totalXP);
      if (newLevel > userRewards.level) {
        userRewards.level = newLevel;
        userRewards.rank = this.calculateRank(newLevel);
      }

      await this.userRewardsRepository.save(userRewards);

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: userRewards
      };
    } catch (error) {
      return {
        message: error?.message,
        data: null
      };
    }
  }

  private mapSourceTypeToCategory(sourceType: string): string {
    const mapping: { [key: string]: string } = {
      task: 'tasks',
      lead: 'leads',
      sale: 'sales',
      attendance: 'attendance',
      collaboration: 'collaboration'
    };

    return mapping[sourceType] || 'other';
  }

  private calculateLevel(xp: number): number {
    for (const [level, range] of Object.entries(LEVELS)) {
      if (xp >= range.min && xp <= range.max) {
        return parseInt(level);
      }
    }
    return 1;
  }

  private calculateRank(level: number): string {
    for (const [rank, range] of Object.entries(RANKS)) {
      if (level >= range.levels[0] && level <= range.levels[1]) {
        return rank;
      }
    }
    return 'ROOKIE';
  }

  async getUserRewards(reference: string) {
    try {
      const userRewards = await this.userRewardsRepository.findOne({
        where: {
          owner: {

          }
        },
        relations: ['xpTransactions', 'achievements', 'inventory']
      });

      if (!userRewards) {
        throw new NotFoundException('User rewards not found');
      }

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: userRewards
      };
    } catch (error) {
      return {
        message: error?.message,
        data: null
      };
    }
  }

  async getLeaderboard() {
    try {
      const leaderboard = await this.userRewardsRepository.find({
        relations: ['user'],
        order: {
          totalXP: 'DESC'
        },
        take: 10
      });

      return {
        message: process.env.SUCCESS_MESSAGE,
        data: leaderboard.map(entry => ({
          owner: { uid: entry.owner.uid },
          username: entry.owner.username,
          totalXP: entry.totalXP,
          level: entry.level,
          rank: entry.rank
        }))
      };
    } catch (error) {
      return {
        message: error?.message,
        data: null
      };
    }
  }
}
