import { User } from '../../user/entities/user.entity';
import { Achievement } from './achievement.entity';
import { UnlockedItem } from './unlocked-item.entity';
import { XPTransaction } from './xp-transaction.entity';
export declare class UserRewards {
    uid: number;
    owner: User;
    currentXP: number;
    totalXP: number;
    level: number;
    rank: string;
    achievements: Achievement[];
    inventory: UnlockedItem[];
    xpTransactions: XPTransaction[];
    xpBreakdown: {
        tasks: number;
        leads: number;
        sales: number;
        attendance: number;
        collaboration: number;
        other: number;
    };
    lastAction: Date;
    createdAt: Date;
    updatedAt: Date;
}
