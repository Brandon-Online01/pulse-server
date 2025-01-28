import {
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    Index,
    BeforeUpdate,
    Column,
} from 'typeorm';

@Index(['createdAt', 'updatedAt'])
@Index(['isDeleted'])
export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @DeleteDateColumn({
        type: 'timestamp',
        nullable: true,
    })
    deletedAt?: Date;

    @Index()
    @Column({ default: false })
    isDeleted: boolean;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }
} 