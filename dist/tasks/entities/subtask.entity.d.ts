import { Task } from './task.entity';
import { SubTaskStatus } from 'src/lib/enums/status.enums';
export declare class SubTask {
    uid: number;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    status: SubTaskStatus;
    isDeleted: boolean;
    task: Task;
}
