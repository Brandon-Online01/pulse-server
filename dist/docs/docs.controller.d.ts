import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
export declare class DocsController {
    private readonly docsService;
    constructor(docsService: DocsService);
    create(createDocDto: CreateDocDto): Promise<{
        message: any;
    }>;
    uploadFile(file: Express.Multer.File, type?: string, req?: any): Promise<{
        fileName: string;
        publicUrl: string;
        metadata: Record<string, any>;
        docId?: number;
        message: string;
    }>;
    deleteFromBucket(ref: number): Promise<{
        message: string;
    }>;
    getExtension(filename: string): Promise<string>;
    findAll(): Promise<{
        docs: import("./entities/doc.entity").Doc[] | null;
        message: string;
    }>;
    findByUser(ref: number): Promise<{
        message: string;
        docs: import("./entities/doc.entity").Doc[];
    }>;
    findOne(ref: number): Promise<{
        doc: import("./entities/doc.entity").Doc | null;
        message: string;
    }>;
    update(ref: number, updateDocDto: UpdateDocDto): Promise<{
        message: string;
    }>;
    getDownloadUrl(ref: number): Promise<{
        message: string;
        url: string;
        fileName: string;
        mimeType: string;
    }>;
}
