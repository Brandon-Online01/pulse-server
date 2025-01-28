import { CreateSubtaskDto } from './create-subtask.dto';
import { SubTaskStatus } from '../../lib/enums/status.enums';
declare const UpdateSubtaskDto_base: import("@nestjs/common").Type<Partial<CreateSubtaskDto>>;
export declare class UpdateSubtaskDto extends UpdateSubtaskDto_base {
    title?: string;
    description?: string;
    status?: SubTaskStatus;
    isDeleted?: boolean;
}
export {};
