import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../lib/entities/base.entity';
import { License } from './license.entity';
import { User } from '../../user/entities/user.entity';
import { AuditAction } from '../lib/audit.types';

@Entity('license_audit')
export class LicenseAudit extends BaseEntity {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({
		type: 'enum',
		enum: AuditAction,
	})
	action: AuditAction;

	@Column({ unique: true, nullable: false })
	licenseId: number;

	@Column({ unique: true, nullable: false })
	userId: number;

	@Column({ unique: true, nullable: false })
	organizationId: number;

	@Column('json')
	metadata: Record<string, any>;

	@ManyToOne(() => License)
	@JoinColumn({ name: 'licenseId', referencedColumnName: 'uid' })
	license: License;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId', referencedColumnName: 'uid' })
	user: User;
}
