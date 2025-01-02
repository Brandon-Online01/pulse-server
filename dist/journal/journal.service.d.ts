import { Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RewardsService } from '../rewards/rewards.service';
export declare class JournalService {
    private journalRepository;
    private readonly eventEmitter;
    private readonly rewardsService;
    constructor(journalRepository: Repository<Journal>, eventEmitter: EventEmitter2, rewardsService: RewardsService);
    private calculateStats;
    create(createJournalDto: CreateJournalDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        journals: Journal[] | null;
        stats: any;
    }>;
    findOne(ref: number): Promise<{
        message: string;
        journal: Journal | null;
        stats: any;
    }>;
    journalsByUser(ref: number): Promise<{
        message: string;
        journals: Journal[];
        stats: {
            total: number;
        };
    }>;
    getJournalsForDate(date: Date): Promise<{
        message: string;
        journals: Journal[];
    }>;
    update(ref: number, updateJournalDto: UpdateJournalDto): Promise<{
        message: any;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    count(): Promise<{
        total: number;
    }>;
}
