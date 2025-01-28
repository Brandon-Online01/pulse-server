import { CreateSubtaskDto } from './create-subtask.dto';
import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    taskType?: TaskType;
    priority?: TaskPriority;
    deadline?: Date;
    repetitionType?: RepetitionType;
    repetitionEndDate?: Date;
    attachments?: string[];
    assignees?: any[];
    clients?: any[];
    subtasks?: CreateSubtaskDto[];
}
