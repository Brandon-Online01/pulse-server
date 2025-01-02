import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    create(createNewsDto: CreateNewsDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        data: import("./entities/news.entity").News[];
    }>;
    findOne(ref: number): Promise<{
        message: string;
        data: import("./entities/news.entity").News;
    }>;
    update(ref: number, updateNewsDto: UpdateNewsDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
