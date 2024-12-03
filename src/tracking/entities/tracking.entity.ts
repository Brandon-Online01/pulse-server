import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Point, DeleteDateColumn } from 'typeorm';

@Entity('tracking')
export class Tracking {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column('geometry', {
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true
    })
    location: Point;

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
}
