import { User } from './user.entity'; // Adjusted path assuming it's in the same directory
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_targets')
export class UserTarget {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	targetSalesAmount: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	currentSalesAmount: number;

	@Column({ nullable: true })
	targetCurrency: string;

	@Column({ type: 'int', nullable: true })
	targetHoursWorked: number;

	@Column({ type: 'int', nullable: true })
	currentHoursWorked: number;

	@Column({ type: 'int', nullable: true })
	targetNewClients: number;

	@Column({ type: 'int', nullable: true })
	currentNewClients: number;

	@Column({ type: 'int', nullable: true })
	targetNewLeads: number;

	@Column({ type: 'int', nullable: true })
	currentNewLeads: number;

	@Column({ type: 'int', nullable: true })
	targetCheckIns: number;

	@Column({ type: 'int', nullable: true })
	currentCheckIns: number;

	@Column({ type: 'int', nullable: true })
	targetCalls: number;

	@Column({ type: 'int', nullable: true })
	currentCalls: number;

	@Column({ nullable: true })
	targetPeriod: string;

	@Column({ type: 'date', nullable: true })
	periodStartDate: Date;

	@Column({ type: 'date', nullable: true })
	periodEndDate: Date;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToOne(() => User, (user) => user.userTarget)
	user: User;
}
