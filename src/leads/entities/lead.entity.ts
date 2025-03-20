import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Client } from '../../clients/entities/client.entity';
import { LeadStatus } from '../../lib/enums/lead.enums';
import { Organisation } from 'src/organisation/entities/organisation.entity';

@Entity('leads')
export class Lead {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.PENDING })
    status: LeadStatus;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ownerUid' })
    owner: User;

    @Column({ nullable: true })
    ownerUid: number;

    @ManyToOne(() => Organisation, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'organisationUid' })
    organisation: Organisation;

    @Column({ nullable: true })
    organisationUid: number;

    @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'branchUid' })
    branch: Branch;

    @Column({ nullable: true })
    branchUid: number;

    @ManyToOne(() => Client, (client) => client?.leads)
    client: Client;
}
