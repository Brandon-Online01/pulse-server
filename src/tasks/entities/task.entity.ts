import { SubTask } from './subtask.entity';
import { Client } from '../../clients/entities/client.entity';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	BeforeUpdate,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('tasks')
export class Task {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'varchar', length: 255 })
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
	repetitionDeadline: Date;

	@Column({ type: 'datetime', nullable: true })
	completionDate: Date;

	@Column({ type: 'json', nullable: true })
	attachments: string[];

	@Column({ type: 'boolean', default: false })
	isOverdue: boolean;

	@Column({ type: 'varchar', length: 255, nullable: true })
	targetCategory: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ type: 'boolean', default: false })
	isDeleted: boolean;

	// Relations
	@ManyToOne(() => User, (user) => user?.tasks)
	creator: User;

	@Column({ type: 'json', nullable: true })
	assignees: { uid: number }[];

	@Column({ type: 'json', nullable: true })
	clients: { uid: number }[];

	@OneToMany(() => SubTask, (subtask) => subtask.task)
	subtasks: SubTask[];

	@ManyToOne(() => Organisation, (organisation) => organisation.tasks)
	organisation: Organisation;

	@ManyToOne(() => Branch, (branch) => branch.tasks)
	branch: Branch;

	@BeforeInsert()
	setInitialStatus() {
		this.status = TaskStatus.PENDING;
		this.progress = 0;
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
			this.completionDate = now;
		} else if (this.progress > 0 && this.progress < 100 && this.status === TaskStatus.PENDING) {
			this.status = TaskStatus.IN_PROGRESS;
		}

		// Reset overdue flag if task is completed
		if (this.status === TaskStatus.COMPLETED) {
			this.isOverdue = false;
		}
	}
}
