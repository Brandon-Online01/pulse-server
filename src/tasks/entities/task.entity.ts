import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { AttachmentType, Priority, RepetitionType, Status, TaskType } from '../../lib/enums/enums';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from 'src/clients/entities/client.entity';

@Entity('task')
export class Task {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    comment: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: false, default: Status.PENDING })
    status: Status;

    @Column({ nullable: false, default: TaskType.OTHER })
    taskType: TaskType;

    @Column({ nullable: true })
    deadline: Date;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @Column({ nullable: false, type: 'text' })
    description: string;

    @Column({ nullable: false, default: Priority.MEDIUM })
    priority: Priority;

    @Column({ nullable: false, default: 0 })
    progress: number;

    @Column({ nullable: true })
    repetitionType: RepetitionType;

    @Column({ nullable: true })
    repetitionEndDate: Date;

    @Column({ nullable: true })
    lastCompletedAt: Date;

    @OneToMany(() => TaskAttachment, attachment => attachment?.task, { cascade: true })
    attachments: TaskAttachment[];

    @ManyToOne(() => User, (user) => user?.tasks)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.tasks)
    branch: Branch;

    @OneToMany(() => SubTask, subtask => subtask.task, { cascade: true })
    subtasks: SubTask[];

    @ManyToMany(() => User)
    @JoinTable()
    assignees: User[];

    @ManyToOne(() => Client, (client) => client?.tasks)
    client: Client;
}

@Entity('subtask')
export class SubTask {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: false, default: false })
    isCompleted: boolean;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: false, default: 0 })
    order: number;

    @ManyToOne(() => Task, task => task.subtasks, { onDelete: 'CASCADE' })
    task: Task;

    @ManyToOne(() => User, { nullable: true })
    assignee: User;
}

@Entity('task_attachment')
export class TaskAttachment {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    filename: string;

    @Column({ nullable: false })
    originalFilename: string;

    @Column({ nullable: false })
    mimeType: string;

    @Column({ type: 'enum', enum: AttachmentType, default: AttachmentType.OTHER })
    type: AttachmentType;

    @Column({ nullable: false })
    fileSize: number;

    @Column({ nullable: false })
    path: string;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    uploadedAt: Date;

    @ManyToOne(() => User)
    uploadedBy: User;

    @ManyToOne(() => Task, task => task?.attachments, { onDelete: 'CASCADE' })
    task: Task;
}