import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organisation } from './organisation.entity';

@Entity()
export class OrganisationHours {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ unique: true })
	ref: string;

	@Column({ type: 'time' })
	openTime: string;

	@Column({ type: 'time' })
	closeTime: string;

	@Column({ type: 'json' })
	weeklySchedule: {
		monday: boolean;
		tuesday: boolean;
		wednesday: boolean;
		thursday: boolean;
		friday: boolean;
		saturday: boolean;
		sunday: boolean;
	};

	@Column({ type: 'json', nullable: true })
	specialHours: {
		date: string;
		openTime: string;
		closeTime: string;
	}[];

	@Column({ default: false })
	isDeleted: boolean;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@ManyToOne(() => Organisation, (organisation) => organisation.hours)
	@JoinColumn({ name: 'organisationUid' })
	organisation: Organisation;

	@Column()
	organisationUid: number;
}
