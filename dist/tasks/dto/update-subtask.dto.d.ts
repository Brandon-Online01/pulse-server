import { SubTaskStatus } from '../../lib/enums/status.enums';
export declare class UpdateSubtaskDto {
    title?: string;
    description?: string;
    status?: SubTaskStatus;
    isDeleted?: boolean;
}
