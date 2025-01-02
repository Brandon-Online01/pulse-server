import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
export declare class DocsController {
    private readonly docsService;
    constructor(docsService: DocsService);
    create(createDocDto: CreateDocDto): Promise<{
        message: any;
    }>;
    uploadToBucket(file: Express.Multer.File): Promise<{
        newFileName: string;
        message: string;
    }>;
    deleteFromBucket(ref: string): Promise<{
        message: string;
    }>;
    getExtension(filename: string): Promise<string>;
    findAll(): Promise<{
        docs: import("./entities/doc.entity").Doc[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        doc: import("./entities/doc.entity").Doc | null;
        message: string;
    }>;
    docsByUser(ref: number): Promise<{
        message: string;
        docs: import("./entities/doc.entity").Doc[];
    }>;
    update(ref: number, updateDocDto: UpdateDocDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
