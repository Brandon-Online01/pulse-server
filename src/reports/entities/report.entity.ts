import { Organisation } from '../../organisation/entities/organisation.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Branch } from '../../branch/entities/branch.entity';
import { User } from '../../user/entities/user.entity';
import { ReportType } from '../constants/report-types.enum';

@Entity('reports')
@Index(['owner', 'generatedAt']) // User report queries
@Index(['reportType', 'generatedAt']) // Report type filtering
@Index(['organisation', 'branch', 'generatedAt']) // Regional reports
@Index(['generatedAt']) // Date-based sorting
export class Report {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column()
	name: string;

	@Column({ nullable: true })
	description: string;

	@Column({
		type: 'enum',
		enum: ReportType,
		default: ReportType.MAIN
	})
	reportType: ReportType;

	@Column({ type: 'json', nullable: true })
	filters: Record<string, any>;

	@CreateDateColumn()
	generatedAt: Date;

	@Column({ type: 'json' })
	reportData: Record<string, any>;

	@Column({ nullable: true })
	notes: string;

	@ManyToOne(() => Organisation, (organisation) => organisation.reports)
	organisation: Organisation;

	@ManyToOne(() => Branch, (branch) => branch.reports)
	branch: Branch;

	@ManyToOne(() => User, (user) => user.reports)
	owner: User;
}
