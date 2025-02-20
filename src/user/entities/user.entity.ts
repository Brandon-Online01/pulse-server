import { AccessLevel } from '../../lib/enums/user.enums';
import { AccountStatus } from '../../lib/enums/status.enums';
import { UserProfile } from './user.profile.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Doc } from '../../docs/entities/doc.entity';
import { Journal } from '../../journal/entities/journal.entity';
import { News } from '../../news/entities/news.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Client } from '../../clients/entities/client.entity';
import { Quotation } from '../../shop/entities/quotation.entity';
import { CheckIn } from '../../check-ins/entities/check-in.entity';
import { Tracking } from '../../tracking/entities/tracking.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { Report } from '../../reports/entities/report.entity';
import { UserRewards } from '../../rewards/entities/user-rewards.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { UserEmployeementProfile } from './user.employeement.profile.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column({ unique: true })
    email: string;

    @Column()
    phone: string;

    @Column({ default: 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png' })
    photoURL: string;

    @Column({ type: 'enum', enum: AccessLevel })
    accessLevel: AccessLevel;

    @Column({ unique: true, nullable: true })
    userref: string;

    @ManyToOne(() => Organisation, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'organisationRef' })
    organisation: Organisation;

    @Column({ nullable: true })
    organisationRef: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING })
    status: AccountStatus;

    @Column({ nullable: true })
    verificationToken: string;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ type: 'timestamp', nullable: true })
    tokenExpires: Date;

    @OneToOne(() => UserProfile, (userProfile) => userProfile?.owner, { nullable: true })
    userProfile: UserProfile;

    @OneToOne(() => UserEmployeementProfile, (userEmployeementProfile) => userEmployeementProfile?.owner, { nullable: true })
    userEmployeementProfile: UserEmployeementProfile;

    @OneToMany(() => Attendance, (attendance) => attendance?.owner, { nullable: true })
    userAttendances: Attendance[];

    @OneToMany(() => Claim, (claim) => claim?.owner, { nullable: true })
    userClaims: Claim[];

    @OneToMany(() => Doc, (doc) => doc?.owner, { nullable: true })
    userDocs: Doc[];

    @OneToMany(() => Lead, (lead) => lead?.owner, { nullable: true })
    leads: Lead[];

    @OneToMany(() => Journal, (journal) => journal?.owner, { nullable: true })
    journals: Journal[];

    @OneToMany(() => Task, (task) => task?.creator, { nullable: true })
    userTasks: Task[];

    @OneToMany(() => Task, (task) => task?.assignees, { nullable: true })
    tasksAssigned: Task[];

    @OneToMany(() => News, (news) => news?.author, { nullable: true })
    articles: News[];

    @OneToMany(() => Asset, (asset) => asset?.owner, { nullable: true })
    assets: Asset[];

    @OneToMany(() => Tracking, (tracking) => tracking?.owner, { nullable: true })
    trackings: Tracking[];

    @OneToMany(() => Quotation, (quotation) => quotation?.placedBy, { nullable: true })
    quotations: Quotation[];

    @OneToMany(() => Notification, (notification) => notification?.owner, { nullable: true })
    notifications: Notification[];

    @ManyToOne(() => Branch, (branch) => branch?.users)
    branch: Branch;

    @OneToMany(() => Client, (client) => client?.assignedSalesRep, { nullable: true })
    clients: Client[];

    @OneToMany(() => CheckIn, (checkIn) => checkIn?.owner, { nullable: true })
    checkIns: CheckIn[];

    @OneToOne(() => UserRewards, (userRewards) => userRewards?.owner, { nullable: true })
    rewards: UserRewards;

    @OneToMany(() => Report, (report) => report?.owner, { nullable: true })
    reports: Report[];
}
