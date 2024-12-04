import { Branch } from 'src/branch/entities/branch.entity';
import { Status, TaskType } from '../../lib/enums/enums';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('task')
export class Task {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    comment: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: false })
    client: string;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: false, default: Status.PENDING })
    status: Status;

    @ManyToOne(() => User, (user) => user?.tasks)
    owner: User;

    @Column({ nullable: false, default: TaskType.OTHER })
    taskType: TaskType;

    @Column({ nullable: true })
    deadline: Date;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @ManyToOne(() => Branch, (branch) => branch?.tasks)
    branch: Branch;
}
