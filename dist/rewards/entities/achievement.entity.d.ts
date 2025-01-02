import { UserRewards } from './user-rewards.entity';
import { AchievementCategory } from '../../lib/enums/rewards.enum';
export declare class Achievement {
    uid: number;
    name: string;
    description: string;
    xpValue: number;
    icon: string;
    requirements: any;
    category: AchievementCategory;
    isRepeatable: boolean;
    userRewards: UserRewards;
    createdAt: Date;
    updatedAt: Date;
}
