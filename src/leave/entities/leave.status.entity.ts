import { User } from 'src/user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('leave_status')
export class LeaveStatus {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'float' })
	availableDays: number;

	@Column({ type: 'float' })
	accumulatedDays: number;

	@ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
	owner: User;

	@Column({ type: 'timestamp' })
	createdAt: Date;

	@Column({ type: 'timestamp' })
	updatedAt: Date;
}
