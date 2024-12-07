import { NotificationType, NotificationStatus } from "../../lib/enums/enums";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('notification')
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

    @ManyToOne(() => User, user => user?.notifications)
    owner: User;
}
