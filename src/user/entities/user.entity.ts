import { AccessLevel } from '../../lib/enums/user.enums';
import { UserProfile } from './user.profile.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Doc } from '../../docs/entities/doc.entity';
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
import { Journal } from 'src/journal/entities/journal.entity';
import { Route } from 'src/tasks/entities/route.entity';

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

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    photoURL: string;

    @Column({ default: 'user' })
    role: string;

    @Column({ default: 'active' })
    status: string;

    @Column({ nullable: true })
    departmentId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'enum', enum: AccessLevel })
    accessLevel: AccessLevel;

    @Column({ unique: true, nullable: true })
    userref: string;

    @ManyToOne(() => Organisation, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'organisationRef' })
    organisation: Organisation;

    @Column({ nullable: true })
    organisationRef: string;

    @Column({ nullable: true })
    verificationToken: string;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ type: 'timestamp', nullable: true })
    tokenExpires: Date;

    @OneToOne(() => UserProfile, (userProfile) => userProfile?.owner, { nullable: true })
    @JoinColumn()
    userProfile: UserProfile;

    @OneToOne(() => UserEmployeementProfile, (userEmployeementProfile) => userEmployeementProfile?.owner, { nullable: true })
    @JoinColumn()
    userEmployeementProfile: UserEmployeementProfile;;

    @OneToMany(() => Attendance, (attendance) => attendance.owner)
    attendance: Attendance[];

    @OneToMany(() => Report, (report) => report.owner)
    reports: Report[];

    @OneToMany(() => Claim, (claim) => claim?.owner, { nullable: true })
    userClaims: Claim[];

    @OneToMany(() => Doc, (doc) => doc?.owner, { nullable: true })
    userDocs: Doc[];

    @OneToMany(() => Lead, (lead) => lead?.owner, { nullable: true })
    leads: Lead[];

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

    @OneToMany(() => Journal, (journal) => journal.owner)
    journals: Journal[];

    @Column({ default: false })
    isDeleted: boolean; 

    @OneToMany(() => Task, (task) => task?.creator)
    tasks: Task[];

    @OneToMany(() => Route, (route) => route?.assignee)
    routes: Route[]; 
}
