import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { TaskFlag } from './task-flag.entity';
import { TaskFlagItemStatus } from '../../lib/enums/task.enums';

@Entity('task_flag_items')
@Index(['taskFlag', 'status'])
@Index(['status', 'isDeleted'])
@Index(['createdAt'])
export class TaskFlagItem {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: TaskFlagItemStatus, default: TaskFlagItemStatus.PENDING })
    status: TaskFlagItemStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @ManyToOne(() => TaskFlag, (taskFlag) => taskFlag.items)
    taskFlag: TaskFlag;
} 