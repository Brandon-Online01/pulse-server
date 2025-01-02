import { CreateJournalDto } from './create-journal.dto';
declare const UpdateJournalDto_base: import("@nestjs/common").Type<Partial<CreateJournalDto>>;
export declare class UpdateJournalDto extends UpdateJournalDto_base {
    comments?: string;
    clientRef?: string;
    fileURL?: string;
    owner?: {
        uid: number;
    };
    branch?: {
        uid: number;
    };
}
export {};
