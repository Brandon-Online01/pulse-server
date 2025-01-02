import { UserRewards } from './user-rewards.entity';
export declare class XPTransaction {
    uid: number;
    userRewards: UserRewards;
    action: string;
    xpAmount: number;
    metadata: {
        sourceId: string;
        sourceType: string;
        details: any;
    };
    timestamp: Date;
}
