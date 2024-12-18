import { Organisation } from "../../organisation/entities/organisation.entity";
import { GeneralStatus } from "../../lib/enums/status.enums";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tracking } from "../../tracking/entities/tracking.entity";
import { Task } from "../../tasks/entities/task.entity";
import { News } from "../../news/entities/news.entity";
import { Lead } from "../../leads/entities/lead.entity";
import { Journal } from "../../journal/entities/journal.entity";
import { Doc } from "../../docs/entities/doc.entity";
import { Claim } from "../../claims/entities/claim.entity";
import { Attendance } from "../../attendance/entities/attendance.entity";
import { Asset } from "../../assets/entities/asset.entity";
import { User } from "src/user/entities/user.entity";

@Entity('branch')
export class Branch {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: false })
    contactPerson: string;

    @Column({ nullable: false, unique: true })
    ref: string;

    @Column({ nullable: false })
    address: string;

    @Column({ nullable: false })
    website: string;

    @Column({ nullable: false, default: GeneralStatus.ACTIVE })
    status: GeneralStatus;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Organisation, (organisation) => organisation?.branches)
    organisation: Organisation;

    @OneToMany(() => Tracking, (tracking) => tracking?.branch)
    trackings: Tracking[];

    @OneToMany(() => Task, (task) => task?.branch)
    tasks: Task[];

    @OneToMany(() => News, (news) => news?.branch)
    news: News[];

    @OneToMany(() => Lead, (lead) => lead?.branch)
    leads: Lead[];

    @OneToMany(() => Journal, (journal) => journal?.branch)
    journals: Journal[];

    @OneToMany(() => Doc, (doc) => doc?.branch)
    docs: Doc[];

    @OneToMany(() => Claim, (claim) => claim?.branch)
    claims: Claim[];

    @OneToMany(() => Attendance, (attendance) => attendance?.branch)
    attendances: Attendance[];

    @OneToMany(() => Asset, (asset) => asset?.branch)
    assets: Asset[];

    @OneToMany(() => User, (user) => user?.branch)
    users: User[];
}
