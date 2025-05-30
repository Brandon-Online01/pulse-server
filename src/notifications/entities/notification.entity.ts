import { User } from "../../user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from "typeorm";
import { NotificationType, NotificationStatus, NotificationPriority } from "../../lib/enums/notification.enums";
import { Branch } from "src/branch/entities/branch.entity";
import { Organisation } from "src/organisation/entities/organisation.entity";

@Entity('notification')
@Index(['owner', 'status']) // User notification queries
@Index(['type', 'status']) // Notification type filtering
@Index(['status', 'createdAt']) // Unread notifications
@Index(['priority', 'createdAt']) // Priority-based notifications
@Index(['organisation', 'branch', 'createdAt']) // Regional notifications
export class Notification {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, type: 'enum', enum: NotificationType, default: NotificationType.USER })
    type: NotificationType;

    @Column({ nullable: false, type: 'varchar', length: 100 })
    title: string;

    @Column({ nullable: false, type: 'text' })
    message: string;

    @Column({ nullable: false, type: 'enum', enum: NotificationStatus, default: NotificationStatus.UNREAD })
    status: NotificationStatus;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
    createdAt: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', type: 'timestamp' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => User, user => user?.notifications)
    owner: User;

    @ManyToOne(() => Organisation, organisation => organisation?.notifications)
    organisation: Organisation;

    @ManyToOne(() => Branch, branch => branch?.notifications)
    branch: Branch;

    @Column({ nullable: true, type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
    priority: NotificationPriority;
}
