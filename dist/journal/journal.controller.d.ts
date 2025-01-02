import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
export declare class JournalController {
    private readonly journalService;
    constructor(journalService: JournalService);
    create(createJournalDto: CreateJournalDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        journals: import("./entities/journal.entity").Journal[] | null;
        stats: any;
    }>;
    findOne(ref: number): Promise<{
        message: string;
        journal: import("./entities/journal.entity").Journal | null;
        stats: any;
    }>;
    journalsByUser(ref: number): Promise<{
        message: string;
        journals: import("./entities/journal.entity").Journal[];
        stats: {
            total: number;
        };
    }>;
    update(ref: number, updateJournalDto: UpdateJournalDto): Promise<{
        message: any;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
