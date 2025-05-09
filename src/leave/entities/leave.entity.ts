import { Branch } from '../../branch/entities/branch.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { User } from '../../user/entities/user.entity';
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	Index,
	DeleteDateColumn,
} from 'typeorm';
import { LeaveType, LeaveStatus, HalfDayPeriod } from '../../lib/enums/leave.enums';

@Entity('leave')
export class Leave {
	@PrimaryGeneratedColumn()
	uid: number;

	@ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
	owner?: User;

	@Column({
		type: 'enum',
		enum: LeaveType,
	})
	leaveType: LeaveType;

	@Column({ type: 'date' })
	startDate: Date;

	@Column({ type: 'date' })
	endDate: Date;

	@Column({ type: 'float' })
	duration: number;

	// For better tracking of leave periods
	@Column({ type: 'boolean', default: false })
	isRecurring: boolean;

	@Column({ type: 'simple-json', nullable: true })
	recurrencePattern?: {
		frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
		interval: number;
		endDate?: Date;
		exceptions?: Date[];
	};

	@Column({ type: 'simple-json', nullable: true })
	approvalPath?: {
		approvers: User[];
		currentApprover: number;
		isApproved: boolean;
	};

	@Column({ type: 'boolean', default: false })
	requiresMultipleApprovals: boolean;

	@Column({ type: 'text', nullable: true })
	motivation?: string;

	@Column({
		type: 'enum',
		enum: LeaveStatus,
		default: LeaveStatus.PENDING,
	})
	status: LeaveStatus;

	@ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
	approvedBy?: User;

	@Column({ type: 'text', nullable: true })
	comments?: string;

	@Column({ type: 'boolean', default: false })
	isHalfDay: boolean;

	@Column({
		type: 'enum',
		enum: HalfDayPeriod,
		nullable: true,
	})
	halfDayPeriod?: HalfDayPeriod;

	@Column({ type: 'simple-json', nullable: true })
	attachments?: string[];

	@ManyToOne(() => Organisation, { nullable: true, onDelete: 'SET NULL' })
	organisation?: Organisation;

	@ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
	branch?: Branch;

	@Column({ type: 'timestamp', nullable: true })
	approvedAt?: Date;

	@Column({ type: 'timestamp', nullable: true })
	rejectedAt?: Date;

	@Column({ type: 'text', nullable: true })
	rejectionReason?: string;

	@Column({ type: 'boolean', default: false })
	isPublicHoliday: boolean;

	@Column({ type: 'timestamp', nullable: true })
	cancelledAt?: Date;

	@Column({ type: 'text', nullable: true })
	cancellationReason?: string;

	@Column({ type: 'boolean', default: false })
	isPaid: boolean;

	@Column({ type: 'float', nullable: true })
	paidAmount?: number;

	@ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
	delegatedTo?: User;

	@Column({ type: 'boolean', default: false })
	isDelegated: boolean;

	@Column({ type: 'simple-array', nullable: true })
	tags?: string[];

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deletedAt?: Date;
}
