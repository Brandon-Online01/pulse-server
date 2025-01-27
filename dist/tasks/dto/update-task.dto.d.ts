import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { CreateSubtaskDto } from './create-subtask.dto';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    taskType?: TaskType;
    priority?: TaskPriority;
    progress?: number;
    deadline?: Date;
    repetitionType?: RepetitionType;
    repetitionEndDate?: Date;
    attachments?: string[];
    branch?: any;
    assignees?: any[];
    client?: any;
    subtasks?: CreateSubtaskDto[];
}
