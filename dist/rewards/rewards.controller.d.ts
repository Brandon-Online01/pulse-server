import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    awardXP(createRewardDto: CreateRewardDto): Promise<{
        message: string;
        rewards: import("./entities/user-rewards.entity").UserRewards;
    } | {
        message: any;
        rewards: any;
    }>;
    getUserRewards(reference: number): Promise<{
        message: any;
        rewards: any;
    }>;
    getLeaderboard(): Promise<{
        message: any;
        rewards: any;
    }>;
}
