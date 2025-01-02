import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UserRewards } from './entities/user-rewards.entity';
import { XPTransaction } from './entities/xp-transaction.entity';
export declare class RewardsService {
    private userRewardsRepository;
    private xpTransactionRepository;
    constructor(userRewardsRepository: Repository<UserRewards>, xpTransactionRepository: Repository<XPTransaction>);
    awardXP(createRewardDto: CreateRewardDto): Promise<{
        message: string;
        rewards: UserRewards;
    } | {
        message: any;
        rewards: any;
    }>;
    private mapSourceTypeToCategory;
    private calculateLevel;
    private calculateRank;
    getUserRewards(reference: number): Promise<{
        message: any;
        rewards: any;
    }>;
    getLeaderboard(): Promise<{
        message: any;
        rewards: any;
    }>;
}
