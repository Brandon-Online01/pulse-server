import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { ReportType, ReportFormat, ReportStatus, ReportTimeframe } from '../../lib/enums/report.enums';

@Entity('reports')
export class Report {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'enum', enum: ReportType })
	type: ReportType;

	@Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.JSON })
	format: ReportFormat;

	@Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
	status: ReportStatus;

	@Column({ type: 'enum', enum: ReportTimeframe })
	timeframe: ReportTimeframe;

	@Column({ type: 'timestamp' })
	startDate: Date;

	@Column({ type: 'timestamp' })
	endDate: Date;

	@Column({ type: 'json', nullable: true })
	filters: {
		departments?: string[];
		products?: string[];
		status?: string[];
		locations?: string[];
	};

	@Column({ type: 'json' })
	data: any;

	@Column({ type: 'text', nullable: true })
	summary: string;

	@Column({ type: 'text', nullable: true })
	errorMessage: string;

	@Column({ type: 'varchar', nullable: true })
	fileUrl: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ type: 'timestamp', nullable: true })
	completedAt: Date;

	@Column({ type: 'boolean', default: false })
	isDeleted: boolean;

	// Relations
	@ManyToOne(() => User, (user) => user.reports)
	@JoinColumn({ name: 'ownerUid' })
	owner: User;

	@Column({ nullable: true })
	ownerUid: number;

	@ManyToOne(() => Organisation, (organisation) => organisation.reports)
	@JoinColumn({ name: 'organisationRef' })
	organisation: Organisation;

	@Column({ nullable: true })
	organisationRef: string;

	@ManyToOne(() => Branch, (branch) => branch.reports)
	@JoinColumn({ name: 'branchUid' })
	branch: Branch;

	@Column({ nullable: true })
	branchUid: number;

	// Metrics
	@Column({ type: 'json', nullable: true })
	metrics: {
		productivityScore?: number;
		efficiencyScore?: number;
		customerSatisfaction?: number;
		responseTime?: number;
		taskCompletionRate?: number;
		quotationConversionRate?: number;
		claimProcessingTime?: number;
		attendanceRate?: number;
	};

	// Metadata
	@Column({ type: 'json', nullable: true })
	metadata: {
		generatedBy?: string;
		generationTime?: number;
		dataPoints?: number;
		version?: string;
		source?: string;
	};
}
