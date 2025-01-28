import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Client } from '../../clients/entities/client.entity';
import { LeadStatus } from '../../lib/enums/leads.enums';

@Entity('lead')
export class Lead {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true, type: 'text' })
    notes: string;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: false, default: LeadStatus.PENDING })
    status: LeadStatus;

    @Column({ default: false })
    isDeleted: boolean;

    @ManyToOne(() => User, user => user?.leads)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.leads)
    branch: Branch;

    @ManyToOne(() => Client, (client) => client?.leads)
    client: Client;
}
