import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserRewards } from './user-rewards.entity';
import { AchievementCategory } from '../../lib/enums/rewards.enum';

@Entity('achievement')
@Index(['userRewards'])
@Index(['category'])
@Index(['isRepeatable'])
@Index(['createdAt'])
export class Achievement {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    xpValue: number;

    @Column()
    icon: string;

    @Column('json')
    requirements: any;

    @Column({
        type: 'enum',
        enum: AchievementCategory,
        default: AchievementCategory.SPECIAL
    })
    category: AchievementCategory;

    @Column({ default: false })
    isRepeatable: boolean;

    @ManyToOne(() => UserRewards, userRewards => userRewards.achievements)
    userRewards: UserRewards;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
} 