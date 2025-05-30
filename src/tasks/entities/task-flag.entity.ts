import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Task } from './task.entity';
import { User } from 'src/user/entities/user.entity';
import { TaskFlagStatus } from '../../lib/enums/task.enums';
import { TaskFlagItem } from './task-flag-item.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

@Entity('task_flags')
@Index(['task', 'status'])
@Index(['status', 'isDeleted'])
@Index(['createdBy', 'createdAt'])
@Index(['deadline', 'status'])
@Index(['createdAt'])
export class TaskFlag {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;
    
    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: TaskFlagStatus, default: TaskFlagStatus.OPEN })
    status: TaskFlagStatus;

    @Column({ type: 'datetime', nullable: true })
    deadline: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @Column({ type: 'json', nullable: true })
    comments: {
        uid: number;
        content: string;
        createdAt: Date;
        createdBy: { uid: number; name: string };
    }[];

    @Column({ type: 'json', nullable: true })
    attachments: string[];

    @ManyToOne(() => Task, (task) => task.flags)
    task: Task;

    @ManyToOne(() => User, (user) => user.taskFlags)
    createdBy: User;

    @OneToMany(() => TaskFlagItem, (item) => item.taskFlag)
    items: TaskFlagItem[];
} 