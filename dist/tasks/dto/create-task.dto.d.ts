import { TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { CreateSubtaskDto } from './create-subtask.dto';
export declare class CreateTaskDto {
    title: string;
    description: string;
    taskType?: TaskType;
    priority?: TaskPriority;
    deadline?: Date;
    repetitionType?: RepetitionType;
    repetitionEndDate?: Date;
    attachments?: string[];
    assigneeIds?: number[];
    clientIds?: number[];
    subtasks?: CreateSubtaskDto[];
}
