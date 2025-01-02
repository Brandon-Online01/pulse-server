import { CreateTaskDto } from './create-task.dto';
import { TaskType } from '../../lib/enums/task.enums';
import { CreateSubtaskDto } from './create-subtask.dto';
declare const UpdateTaskDto_base: import("@nestjs/common").Type<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    owner: {
        uid: number;
    };
    taskType: TaskType;
    deadline: Date;
    branch: {
        uid: number;
    };
    subtasks?: CreateSubtaskDto[];
}
export {};
