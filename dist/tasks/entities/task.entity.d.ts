import { SubTask } from './subtask.entity';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { User } from 'src/user/entities/user.entity';
import { Route } from './route.entity';
export declare class Task {
    uid: number;
    title: string;
    description: string;
    status: TaskStatus;
    taskType: TaskType;
    priority: TaskPriority;
    repetitionType: RepetitionType;
    progress: number;
    deadline: Date;
    repetitionDeadline: Date;
    completionDate: Date;
    attachments: string[];
    isOverdue: boolean;
    targetCategory: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    creator: User;
    assignees: {
        uid: number;
    }[];
    clients: {
        uid: number;
    }[];
    subtasks: SubTask[];
    routes: Route[];
    organisation: Organisation;
    branch: Branch;
    setInitialStatus(): void;
    updateStatus(): void;
}
