import { Branch } from 'src/branch/entities/branch.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';

@Entity('communication_logs')
@Index(['emailType', 'createdAt']) // Email type tracking
@Index(['messageId']) // Message tracking
@Index(['organisation', 'branch', 'createdAt']) // Regional communication logs
@Index(['createdAt']) // Date-based sorting
export class CommunicationLog {
	@PrimaryGeneratedColumn('uuid')
	uid: string;

	@Column('varchar', { nullable: true })
	emailType: string;

	@Column('simple-array', { nullable: true })
	recipientEmails: string[];

	@Column('simple-array', { nullable: true })
	accepted: string[];

	@Column('simple-array', { nullable: true })
	rejected: string[];

	@Column({ nullable: true })
	messageId: string;

	@Column({ nullable: true })
	messageSize: number;

	@Column({ nullable: true })
	envelopeTime: number;

	@Column({ nullable: true })
	messageTime: number;

	@Column('json', { nullable: true })
	response: string;

	@Column('json', { nullable: true })
	envelope: {
		from: string;
		to: string[];
	};

	@Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@ManyToOne(() => Branch, (branch) => branch?.communicationLogs)
	branch: Branch;

	@ManyToOne(() => Organisation, (organisation) => organisation?.communicationLogs)
	organisation: Organisation;
}
