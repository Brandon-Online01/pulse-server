import { TaskStatus, TaskPriority, RepetitionType, TaskType, JobStatus } from '../../lib/enums/task.enums';
import { AssigneeDto, ClientDto, CreatorDto } from './create-task.dto';
import { UpdateSubtaskDto } from './update-subtask.dto';
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
    subtasks?: UpdateSubtaskDto[];
    creators?: CreatorDto[];
    comment?: string;
    jobStartTime?: Date;
    jobEndTime?: Date;
    jobDuration?: number;
    jobStatus?: JobStatus;
}
