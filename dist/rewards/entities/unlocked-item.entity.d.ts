import { UserRewards } from './user-rewards.entity';
import { ItemRarity } from 'src/lib/enums/rewards.enum';
import { ItemType } from 'src/lib/enums/rewards.enum';
export declare class UnlockedItem {
    uid: number;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    icon: string;
    requiredLevel: number;
    requiredXP: number;
    userRewards: UserRewards;
    unlockedAt: Date;
}
