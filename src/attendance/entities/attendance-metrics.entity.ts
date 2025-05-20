import { User } from '../../user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('attendance_metrics')
export class AttendanceMetrics {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	totalHours: number;

	@Column({ type: 'int', default: 0 })
	totalDays: number;

	@Column({ type: 'timestamp', nullable: true })
	firstAttendance: Date;

	@Column({ type: 'timestamp', nullable: true })
	latestAttendance: Date;

	@Column({ type: 'int', default: 0 })
	totalShifts: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	averageHoursPerDay: number;

	@Column({ type: 'int', default: 0 })
	totalBreakCount: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	totalBreakHours: number;

	@Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;
}
