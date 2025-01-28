import { SubTask } from './subtask.entity';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
export declare class Task {
    uid: number;
    title: string;
    description: string;
    status: TaskStatus;
    taskType: TaskType;
    priority: TaskPriority;
    progress: number;
    deadline: Date;
    repetitionType: RepetitionType;
    repetitionEndDate: Date;
    lastCompletedAt: Date;
    startDate: Date;
    attachments: string[];
    isDeleted: boolean;
    isOverdue: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: User;
    assignees: User[];
    clients: Client[];
    subtasks: SubTask[];
    setInitialStatus(): void;
    updateStatus(): void;
}
