import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    awardXP(createRewardDto: CreateRewardDto): Promise<{
        message: string;
        data: import("./entities/user-rewards.entity").UserRewards;
    } | {
        message: any;
        data: any;
    }>;
    getUserRewards(reference: number): Promise<{
        message: any;
        data: any;
    }>;
    getLeaderboard(): Promise<{
        message: any;
        data: any;
    }>;
}
