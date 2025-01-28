import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('communication_logs')
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

	@CreateDateColumn()
	createdAt: Date;
} 