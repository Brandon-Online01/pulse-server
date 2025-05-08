import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Client } from '../../clients/entities/client.entity';
import { LeadCategory, LeadStatus } from '../../lib/enums/lead.enums';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';

// Define the structure for status history entries
export interface LeadStatusHistoryEntry {
	timestamp: Date;
	oldStatus?: LeadStatus; // Status before the change
	newStatus: LeadStatus; // Status after the change
	reason?: string; // Reason for the change
	description?: string; // Optional description for the change
	userId?: number; // User who made the change (optional)
	userDetails?: { // Full user details (optional)
		uid: number;
		name: string;
		surname: string;
		email: string;
		photoURL?: string;
	};
}

@Entity('leads')
export class Lead {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	companyName: string;

	@Column({ nullable: true })
	email: string;

	@Column({ nullable: true })
	phone: string;

	@Column({ nullable: true, type: 'enum', enum: LeadCategory, default: LeadCategory.OTHER })
	category: LeadCategory;

	@Column({ nullable: true })
	notes: string;

	@Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.PENDING })
	status: LeadStatus;

	@Column({ type: 'boolean', default: false })
	isDeleted: boolean;

	@Column({ nullable: true })
	image: string;

	@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
	latitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
	longitude: number;

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

	@Column({ type: 'json', nullable: true })
	assignees: { uid: number }[];

	@ManyToOne(() => Client, (client) => client?.leads)
	client: Client;

	@OneToMany(() => Interaction, (interaction) => interaction.lead)
	interactions: Interaction[];

	@Column({ type: 'json', nullable: true })
	changeHistory: LeadStatusHistoryEntry[];
}
