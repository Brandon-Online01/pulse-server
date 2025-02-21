import { TaskStatus, TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
import { AssigneeDto, ClientDto, CreatorDto, SubtaskDto } from './create-task.dto';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    taskType?: TaskType;
    priority?: TaskPriority;
    deadline?: Date;
    repetitionType?: RepetitionType;
    repetitionDeadline?: Date;
    progress?: number;
    attachments?: string[];
    assignees?: AssigneeDto[];
    client?: ClientDto[];
    targetCategory?: string;
    subtasks?: SubtaskDto[];
    creators?: CreatorDto[];
    comment?: string;
}
