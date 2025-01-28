import { SubTaskStatus } from '../../lib/enums/status.enums';
export declare class CreateSubtaskDto {
    title: string;
    description: string;
    status?: SubTaskStatus;
}
