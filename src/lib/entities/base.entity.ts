import {
    CreateDateColumn,
    UpdateDateColumn,
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

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
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