import { User } from 'src/user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Point, DeleteDateColumn, ManyToOne } from 'typeorm';

@Entity('tracking')
export class Tracking {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    latitude?: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    longitude?: number;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    speed?: number;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    heading?: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    altitude?: number;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    accuracy?: number;

    @Column({ nullable: true })
    deviceId?: string;

    @Column({ nullable: true })
    deviceName?: string;

    @Column({ nullable: true })
    macAddress?: string;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    batteryLevel?: number;

    @Column({ nullable: true })
    signalStrength?: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    status?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('json', { nullable: true })
    metadata?: Record<string, any>;

    @DeleteDateColumn()
    deletedAt: Date;

    @Column({ nullable: true })
    deletedBy?: string;

    @ManyToOne(() => Branch, (branch) => branch?.trackings)
    branch: Branch;

    @ManyToOne(() => User, (user) => user?.trackings)
    owner: User;
}
