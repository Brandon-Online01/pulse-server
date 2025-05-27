import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';

@Entity()
@Index(['owner', 'timestamp']) // User location history
@Index(['latitude', 'longitude', 'timestamp']) // Geographic queries
@Index(['timestamp']) // Time-based location queries
@Index(['organisation', 'branch', 'timestamp']) // Regional tracking
@Index(['createdAt']) // Date-based sorting
export class Tracking {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'float', nullable: false })
    latitude: number;

    @Column({ type: 'float', nullable: false })
    longitude: number;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'float', nullable: true })
    distance: number;

    @Column({ type: 'float', nullable: true })
    duration: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @Column({ nullable: true })
    deletedBy: string;

    @ManyToOne(() => Branch, (branch) => branch?.trackings, { nullable: true })
    branch: Branch;

    @ManyToOne(() => Organisation, (organisation) => organisation?.trackings, { nullable: true })
    organisation: Organisation;

    @Column({ type: 'float', nullable: true })
    accuracy: number;

    @Column({ type: 'float', nullable: true })
    altitude: number;

    @Column({ type: 'float', nullable: true })
    altitudeAccuracy: number;

    @Column({ type: 'float', nullable: true })
    heading: number;

    @Column({ type: 'float', nullable: true })
    speed: number;

    @Column({ type: 'bigint', nullable: true })
    timestamp: number;

    @Column({ type: 'int', nullable: true })
    batteryLevel: number;

    @Column({ type: 'int', nullable: true })
    batteryState: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    brand: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    manufacturer: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    modelID: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    modelName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    osName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    osVersion: string;

    @Column({ type: 'json', nullable: true })
    network: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    addressDecodingError: string;

    @Column({ type: 'text', nullable: true })
    rawLocation: string;
}
