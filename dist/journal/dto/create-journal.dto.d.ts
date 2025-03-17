import { JournalStatus } from "src/lib/enums/journal.enums";
export declare class CreateJournalDto {
    clientRef: string;
    fileURL: string;
    owner: {
        uid: number;
    };
    branch: {
        uid: number;
    };
    comments: string;
    status?: JournalStatus;
}
