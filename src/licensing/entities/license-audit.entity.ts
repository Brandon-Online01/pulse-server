import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../lib/entities/base.entity';
import { License } from './license.entity';
import { User } from '../../user/entities/user.entity';
import { AuditAction } from '../lib/audit.service';

@Entity('license_audit')
export class LicenseAudit extends BaseEntity {
    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Column()
    licenseId: number;

    @Column()
    userId: number;

    @Column()
    organizationId: number;

    @Column('json')
    metadata: Record<string, any>;

    @ManyToOne(() => License)
    @JoinColumn({ name: 'licenseId' })
    license: License;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;
} 