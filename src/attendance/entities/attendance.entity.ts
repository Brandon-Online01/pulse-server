import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { AttendanceStatus } from '../../lib/enums/attendance.enums';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('attendance')
export class Attendance {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({
		type: 'enum',
		enum: AttendanceStatus,
		default: AttendanceStatus.PRESENT,
	})
	status: AttendanceStatus;

	@Column({ type: 'timestamp' })
	checkIn: Date;

	@Column({ type: 'timestamp', nullable: true })
	checkOut: Date;

	@Column({ type: 'varchar', nullable: true })
	duration: string;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkInLatitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkInLongitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkOutLatitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkOutLongitude: number;

	@Column({ type: 'text', nullable: true })
	checkInNotes: string;

	@Column({ type: 'text', nullable: true })
	checkOutNotes: string;

	@Column({ type: 'timestamp', nullable: true })
	breakStartTime: Date;

	@Column({ type: 'timestamp', nullable: true })
	breakEndTime: Date;

	@Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
	verifiedAt: Date;

	// Relations
	@ManyToOne(() => User, (user) => user?.attendance)
	owner: User;

	@ManyToOne(() => User, (user) => user?.attendance, { nullable: true })
	verifiedBy: User;

	@ManyToOne(() => Organisation, (organisation) => organisation?.attendances, { nullable: true })
	organisation: Organisation;

	@ManyToOne(() => Branch, (branch) => branch?.attendances, { nullable: true })
	branch: Branch;
}
