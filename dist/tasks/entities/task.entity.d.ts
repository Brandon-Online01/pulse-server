import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Priority, RepetitionType, TaskType } from 'src/lib/enums/task.enums';
import { GeneralStatus } from 'src/lib/enums/status.enums';
import { SubTask } from './subtask.entity';
export declare class Task {
    uid: number;
    comment: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    status: GeneralStatus;
    taskType: TaskType;
    deadline: Date;
    isDeleted: boolean;
    description: string;
    priority: Priority;
    progress: number;
    repetitionType: RepetitionType;
    repetitionEndDate: Date;
    lastCompletedAt: Date;
    attachments: string;
    owner: User;
    branch: Branch;
    assignees: User[];
    client: Client;
    subtasks: SubTask[];
}
