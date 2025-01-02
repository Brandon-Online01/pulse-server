import { TaskType, RepetitionType, Priority } from "../../lib/enums/task.enums";
import { GeneralStatus } from "../../lib/enums/status.enums";
import { CreateSubtaskDto } from "./create-subtask.dto";
export declare class CreateTaskDto {
    comment: string;
    notes?: string;
    description: string;
    status: GeneralStatus;
    owner: {
        uid: number;
    };
    taskType: TaskType;
    deadline?: Date;
    branch: {
        uid: number;
    };
    priority: Priority;
    progress: number;
    assignees: {
        uid: number;
    }[];
    repetitionType?: RepetitionType;
    repetitionEndDate?: Date;
    attachments?: string;
    subtasks?: CreateSubtaskDto[];
}
