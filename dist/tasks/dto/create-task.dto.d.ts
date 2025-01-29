import { TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { CreateSubtaskDto } from './create-subtask.dto';
export declare class CreateTaskDto {
    title: string;
    description: string;
    taskType: TaskType;
    priority: TaskPriority;
    deadline: Date;
    repetitionType: RepetitionType;
    repetitionEndDate?: Date;
    attachments?: string[];
    assignees: {
        uid: number;
    }[];
    client?: {
        uid: number;
    };
    targetCategory?: string;
    subtasks?: CreateSubtaskDto[];
}
