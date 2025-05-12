import { Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity'; // Adjusted path assuming it's in the same directory

@Entity('user_targets')
export class UserTarget {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	targetSalesAmount: number;

	@Column({ nullable: true })
	targetCurrency: string;

	@Column({ type: 'int', nullable: true })
	targetHoursWorked: number;

	@Column({ type: 'int', nullable: true })
	targetNewClients: number;

	@Column({ type: 'int', nullable: true })
	targetNewLeads: number;

	@Column({ type: 'int', nullable: true })
	targetCheckIns: number;

	@Column({ type: 'int', nullable: true })
	targetCalls: number;

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
