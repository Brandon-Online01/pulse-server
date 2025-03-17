import { CreateJournalDto } from './create-journal.dto';
import { JournalStatus } from 'src/lib/enums/journal.enums';
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
    status?: JournalStatus;
}
export {};
