import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity()
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

    @ManyToOne(() => Branch, { nullable: true })
    branch: Branch;
}
