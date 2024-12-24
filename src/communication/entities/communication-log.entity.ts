import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { EmailType } from '../../lib/enums/email.enums';
import { AccessLevel } from '../../lib/enums/user.enums';

@Entity('communication_logs')
export class CommunicationLog {
	@PrimaryGeneratedColumn('uuid')
	uid: string;

	@Column({ type: 'enum', enum: EmailType })
	emailType: EmailType;

	@Column('simple-array')
	recipientRoles: AccessLevel[];

	@Column('simple-array')
	accepted: string[];

	@Column('simple-array')
	rejected: string[];

	@Column({ nullable: true })
	messageId: string;

	@Column()
	messageSize: number;

	@Column()
	envelopeTime: number;

	@Column()
	messageTime: number;

	@Column('json', { nullable: true })
	response: string;

	@Column('json')
	envelope: {
		from: string;
		to: string[];
	};

	@CreateDateColumn()
	createdAt: Date;
} 