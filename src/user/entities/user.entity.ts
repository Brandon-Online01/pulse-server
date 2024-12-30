import { UserProfile } from './user.profile.entity';
import { UserEmployeementProfile } from './user.employeement.profile.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Doc } from '../../docs/entities/doc.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Journal } from '../../journal/entities/journal.entity';
import { Task } from '../../tasks/entities/task.entity';
import { News } from '../../news/entities/news.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { Tracking } from '../../tracking/entities/tracking.entity';
import { Order } from '../../shop/entities/order.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { Client } from 'src/clients/entities/client.entity';
import { AccessLevel } from 'src/lib/enums/user.enums';
import { AccountStatus } from 'src/lib/enums/status.enums';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CheckIn } from 'src/check-ins/entities/check-in.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    surname: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: false })
    photoURL: string;

    @Column({ nullable: false, default: AccessLevel.USER })
    accessLevel: AccessLevel;

    @Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @Column({
        nullable: true,
        default: null
    })
    deletedAt: Date;

    @Column({ nullable: false, default: AccountStatus.ACTIVE })
    status: AccountStatus;

    @Column({ nullable: false })
    username: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: false })
    userref: string;

    //relationships
    @OneToOne(() => UserProfile, (userProfile) => userProfile?.owner)
    @JoinColumn()
    userProfile: UserProfile;

    @OneToOne(() => UserEmployeementProfile, (userEmployeementProfile) => userEmployeementProfile?.owner)
    @JoinColumn()
    userEmployeementProfile: UserEmployeementProfile;

    @OneToMany(() => Attendance, (attendance) => attendance?.owner)
    userAttendances: Attendance[];

    @OneToMany(() => Claim, (claim) => claim?.owner)
    userClaims: Claim[];

    @OneToMany(() => Doc, (doc) => doc?.owner)
    userDocs: Doc[];

    @OneToMany(() => Lead, (lead) => lead?.owner)
    leads: Lead[];

    @OneToMany(() => Journal, (journal) => journal?.owner)
    journals: Journal[];

    @OneToMany(() => Task, (task) => task?.owner)
    tasks: Task[];

    @OneToMany(() => News, (news) => news?.author)
    articles: News[];

    @OneToMany(() => Asset, (asset) => asset?.owner)
    assets: Asset[];

    @OneToMany(() => Tracking, (tracking) => tracking?.owner)
    trackings: Tracking[];

    @OneToMany(() => Order, (order) => order?.placedBy)
    orders: Order[];

    @OneToMany(() => Notification, (notification) => notification?.owner)
    notifications: Notification[];

    @ManyToOne(() => Branch, (branch) => branch?.users)
    branch: Branch;

    @OneToMany(() => Client, (client) => client?.assignedSalesRep)
    clients: Client[];

    @OneToMany(() => CheckIn, (checkIn) => checkIn?.owner)
    checkIns: CheckIn[];
}
