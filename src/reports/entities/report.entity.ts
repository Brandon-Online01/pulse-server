import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { Branch } from '../../branch/entities/branch.entity';
import { ReportType } from '../../lib/enums/reports.enums';
import { User } from '../../user/entities/user.entity';

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn()
    uid: number;

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

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true, default: ReportType.GENERAL })
    type: ReportType;

    @Column({ nullable: true })
    fileUrl: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @ManyToOne(() => Branch, (branch) => branch?.reports)
    branch: Branch;

    @ManyToOne(() => User, (user) => user?.reports)
    owner: User;
}
