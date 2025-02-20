import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('check-ins')
export class CheckIn {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'varchar', nullable: false })
	checkInTime: Date;

	@Column({ type: 'varchar', nullable: false })
	checkInPhoto: string;

	@Column({ type: 'varchar', nullable: false })
	checkInLocation: string;

	@Column({ type: 'varchar', nullable: true })
	checkOutTime: Date;

	@Column({ type: 'varchar', nullable: true })
	checkOutPhoto: string;

	@Column({ type: 'varchar', nullable: true })
	checkOutLocation: string;

	@Column({ type: 'varchar', nullable: true })
	duration: string;

	// Relations
	@ManyToOne(() => User, (user) => user?.checkIns)
	owner: User;

	@ManyToOne(() => Organisation, (organisation) => organisation?.assets, { nullable: true })
	organisation: Organisation;

	@ManyToOne(() => Branch, (branch) => branch?.assets, { nullable: true })
	branch: Branch;
    
	@ManyToOne(() => Client, (client) => client?.checkIns, { nullable: true })
	client: Client;
}
