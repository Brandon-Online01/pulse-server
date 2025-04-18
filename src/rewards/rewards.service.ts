import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UserRewards } from './entities/user-rewards.entity';
import { XPTransaction } from './entities/xp-transaction.entity';
import { LEVELS, RANKS } from '../lib/constants/constants';

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
        rewards: userRewards
      };
    } catch (error) {
      return {
        message: error?.message,
        rewards: null
      };
    }
  }

  private mapSourceTypeToCategory(sourceType: string): string {
    const mapping: { [key: string]: string } = {
      login: 'login',
      task: 'task',
      subtask: 'subtask',
      lead: 'lead',
      sale: 'sale',
      collaboration: 'collaboration',
      attendance: 'attendance',
      'check-in-client': 'check-in-client',
      'check-out-client': 'check-out-client',
      claim: 'claim',
      journal: 'journal',
      notification: 'notification'
    };

    return mapping[sourceType] || 'other';
  }

  private calculateLevel(xp: number): number {
    for (const [level, range] of Object.entries(LEVELS)) {
      if (xp >= range?.min && xp <= range?.max) {
        return parseInt(level);
      }
    }
    return 1;
  }

  private calculateRank(level: number): string {
    for (const [rank, range] of Object.entries(RANKS)) {
      if (level >= range?.levels[0] && level <= range?.levels[1]) {
        return rank;
      }
    }
    return 'ROOKIE';
  }

  async getUserRewards(reference: number) {
    try {
      const userRewards = await this.userRewardsRepository.findOne({
        where: {
          owner: { uid: reference }
        },
        relations: ['xpTransactions', 'achievements', 'inventory']
      });

      if (!userRewards) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        rewards: userRewards
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        rewards: null
      };

      return response;
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

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        rewards: leaderboard.map(entry => ({
          owner: { uid: entry?.owner?.uid },
          username: entry?.owner?.username,
          totalXP: entry?.totalXP,
          level: entry?.level,
          rank: entry?.rank
        }))
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        rewards: null
      };

      return response;
    }
  }
}
