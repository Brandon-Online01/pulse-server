import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { License } from './license.entity';

export enum MetricType {
    USERS = 'users',
    BRANCHES = 'branches',
    STORAGE = 'storage',
    API_CALLS = 'api_calls',
    INTEGRATIONS = 'integrations'
}

@Entity('license_usage')
export class LicenseUsage {
    @PrimaryGeneratedColumn('uuid')
    uid: string;

    @ManyToOne(() => License, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'licenseId' })
    license: License;

    @Column()
    licenseId: string;

    @Column({ type: 'enum', enum: MetricType })
    metricType: MetricType;

    @Column('bigint')
    currentValue: number;

    @Column('bigint')
    limit: number;

    @Column('float')
    utilizationPercentage: number;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    timestamp: Date;
} 