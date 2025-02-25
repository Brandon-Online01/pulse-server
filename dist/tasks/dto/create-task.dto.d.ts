import { TaskPriority, RepetitionType, TaskType } from '../../lib/enums/task.enums';
export declare class AssigneeDto {
    uid: number;
}
export declare class CreatorDto {
    uid: number;
}
export declare class ClientDto {
    uid: number;
    name?: string;
    email?: string;
    address?: string;
    phone?: string;
    contactPerson?: string;
}
export declare class SubtaskDto {
    title: string;
    description: string;
}
export declare class CreateTaskDto {
    title: string;
    description: string;
    taskType: TaskType;
    priority: TaskPriority;
    deadline?: Date;
    repetitionType?: RepetitionType;
    repetitionDeadline?: Date;
    assignees?: AssigneeDto[];
    client?: ClientDto[];
    targetCategory?: string;
    subtasks?: SubtaskDto[];
    creators: CreatorDto[];
    comment?: string;
    organisationId?: number;
    branchId?: number;
}
