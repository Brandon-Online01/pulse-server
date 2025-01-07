import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LicenseType, SubscriptionPlan, LicenseStatus, BillingCycle } from '../../lib/enums/license.enums';
import { Organisation } from '../../organisation/entities/organisation.entity';

@Entity('licenses')
export class License {
    @PrimaryGeneratedColumn('uuid')
    uid: string;

    @Column({ type: 'varchar', unique: true })
    licenseKey: string;

    @Column({ type: 'enum', enum: LicenseType })
    type: LicenseType;

    @Column({ type: 'enum', enum: SubscriptionPlan })
    plan: SubscriptionPlan;

    @Column({ type: 'enum', enum: LicenseStatus })
    status: LicenseStatus;

    @Column({ type: 'enum', enum: BillingCycle })
    billingCycle: BillingCycle;

    @Column({ type: 'int' })
    maxUsers: number;

    @Column({ type: 'int' })
    maxBranches: number;

    @Column({ type: 'bigint' })
    storageLimit: number; // in bytes

    @Column({ type: 'int' })
    apiCallLimit: number;

    @Column({ type: 'int' })
    integrationLimit: number;

    @Column({ type: 'timestamp' })
    validFrom: Date;

    @Column({ type: 'timestamp' })
    validUntil: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastValidated: Date;

    @Column({ type: 'boolean', default: false })
    isAutoRenew: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'json', nullable: true })
    features: Record<string, boolean>;

    @ManyToOne(() => Organisation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organisationRef' })
    organisation: Organisation;

    @Column()
    organisationRef: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 