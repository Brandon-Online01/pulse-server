import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './client.entity';
import { User } from '../../user/entities/user.entity';
import { CommunicationFrequency, CommunicationType } from '../../lib/enums/client.enums';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';

@Entity('client_communication_schedules')
export class ClientCommunicationSchedule {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'enum', enum: CommunicationType })
    communicationType: CommunicationType;

    @Column({ type: 'enum', enum: CommunicationFrequency })
    frequency: CommunicationFrequency;

    @Column({ type: 'int', nullable: true })
    customFrequencyDays: number; // For custom frequency - how many days between communications

    @Column({ type: 'time', nullable: true })
    preferredTime: string; // Preferred time of day (e.g., "09:00", "14:30")

    @Column({ type: 'json', nullable: true })
    preferredDays: number[]; // Array of day numbers (0=Sunday, 1=Monday, etc.)

    @Column({ type: 'datetime', nullable: true })
    nextScheduledDate: Date;

    @Column({ type: 'datetime', nullable: true })
    lastCompletedDate: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>; // For storing additional schedule-specific data

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    // Relations
    @ManyToOne(() => Client, (client) => client.communicationSchedules)
    client: Client;

    @ManyToOne(() => User, (user) => user.clientCommunicationSchedules, { nullable: true })
    assignedTo: User; // The user responsible for this communication

    @ManyToOne(() => Organisation, { nullable: true })
    organisation: Organisation;

    @ManyToOne(() => Branch, { nullable: true })
    branch: Branch;
} 