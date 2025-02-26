import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { Doc } from './entities/doc.entity';
import { Repository } from 'typeorm';
import { StorageService } from '../lib/services/storage.service';
export declare class DocsService {
    private readonly docsRepository;
    private readonly storageService;
    constructor(docsRepository: Repository<Doc>, storageService: StorageService);
    uploadFile(file: Express.Multer.File, type?: string, ownerId?: number, branchId?: number): Promise<{
        fileName: string;
        publicUrl: string;
        metadata: Record<string, any>;
        docId?: number;
        message: string;
    }>;
    private isValidFileType;
    getDownloadUrl(docId: number): Promise<{
        message: string;
        url: string;
        fileName: string;
        mimeType: string;
    }>;
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
    deleteFromBucket(ref: number): Promise<{
        message: string;
    }>;
}
