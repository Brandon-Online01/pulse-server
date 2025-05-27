import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserRewards } from './user-rewards.entity';

@Entity('xp_transaction')
@Index(['userRewards', 'timestamp']) // User XP history
@Index(['action', 'timestamp']) // Action-based XP tracking
@Index(['timestamp']) // Date-based sorting
export class XPTransaction {
    @PrimaryGeneratedColumn()
    uid: number;

    @ManyToOne(() => UserRewards, userRewards => userRewards.xpTransactions)
    userRewards: UserRewards;

    @Column()
    action: string;

    @Column()
    xpAmount: number;

    @Column('json')
    metadata: {
        sourceId: string;
        sourceType: string;
        details: any;
    };

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;
} 