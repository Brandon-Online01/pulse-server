import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NewsService {
    private newsRepository;
    private eventEmitter;
    constructor(newsRepository: Repository<News>, eventEmitter: EventEmitter2);
    create(createNewsDto: CreateNewsDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        data: News[];
    }>;
    findOne(ref: number): Promise<{
        message: string;
        data: News;
    }>;
    update(ref: number, updateNewsDto: UpdateNewsDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
}
