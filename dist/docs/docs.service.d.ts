import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { Doc } from './entities/doc.entity';
import { Repository } from 'typeorm';
export declare class DocsService {
    private readonly docsRepository;
    constructor(docsRepository: Repository<Doc>);
    private bucketName;
    create(createDocDto: CreateDocDto): Promise<{
        message: any;
    }>;
    findAll(): Promise<{
        docs: Doc[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        doc: Doc | null;
        message: string;
    }>;
    docsByUser(ref: number): Promise<{
        message: string;
        docs: Doc[];
    }>;
    update(ref: number, updateDocDto: UpdateDocDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    uploadToBucket(fileData: Express.Multer.File, fileName?: string): Promise<{
        newFileName: string;
        message: string;
    }>;
    deleteFromBucket(fileName: string): Promise<{
        message: string;
    }>;
}
