import { SubTask } from './subtask.entity';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	BeforeUpdate,
} from 'typeorm';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity('tasks')
export class Task {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'text' })
	description: string;

	@Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
	status: TaskStatus;

	@Column({ type: 'enum', enum: TaskType, default: TaskType.OTHER })
	taskType: TaskType;

	@Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
	priority: TaskPriority;

	@Column({ type: 'enum', enum: RepetitionType, default: RepetitionType.NONE })
	repetitionType: RepetitionType;

	@Column({ type: 'int', default: 0 })
	progress: number;

	@Column({ type: 'datetime', nullable: true })
	deadline: Date;

	@Column({ type: 'datetime', nullable: true })
	repetitionEndDate: Date;

	@Column({ type: 'datetime', nullable: true })
	lastCompletedAt: Date;

	@Column({ type: 'datetime', nullable: true })
	startDate: Date;

	@Column({ type: 'json', nullable: true })
	attachments: string[];

	@Column({ type: 'boolean', default: false })
	isDeleted: boolean;

	@Column({ type: 'boolean', default: false })
	isOverdue: boolean;

	@Column({ type: 'varchar', length: 255, nullable: true })
	targetCategory: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => User, (user) => user?.userTasks, { onDelete: 'SET NULL', nullable: true })
	creator: User;

	@ManyToMany(() => User, (user) => user?.tasksAssigned, { cascade: true, nullable: true })
	assignees: User[];

	@ManyToMany(() => Client, (client) => client?.tasks, { cascade: true, nullable: true })
	clients: Client[];

	@OneToMany(() => SubTask, (subtask) => subtask?.task, { cascade: true, nullable: true })
	subtasks: SubTask[];

	@ManyToOne(() => Organisation, (organisation) => organisation?.tasks, { nullable: true })
	organisation: Organisation; 	

	@ManyToOne(() => Branch, (branch) => branch?.tasks, { nullable: true })
	branch: Branch; 

	@BeforeInsert()
	setInitialStatus() {
		this.status = TaskStatus.PENDING;
		this.progress = 0;
		if (!this.startDate) {
			this.startDate = new Date();
		}
	}

	@BeforeUpdate()
	updateStatus() {
		const now = new Date();

		// Check for overdue
		if (this.deadline && now > this.deadline && this.status !== TaskStatus.COMPLETED) {
			this.status = TaskStatus.OVERDUE;
			this.isOverdue = true;
		}

		// Update status based on progress
		if (this.progress === 100 && this.status !== TaskStatus.COMPLETED) {
			this.status = TaskStatus.COMPLETED;
			this.lastCompletedAt = now;
		} else if (this.progress > 0 && this.progress < 100 && this.status === TaskStatus.PENDING) {
			this.status = TaskStatus.IN_PROGRESS;
		}

		// Reset overdue flag if task is completed
		if (this.status === TaskStatus.COMPLETED) {
			this.isOverdue = false;
		}
	}
}
