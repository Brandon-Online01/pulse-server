export declare class CreateDocDto {
    title: string;
    content: string;
    description?: string;
    fileType: string;
    fileSize: number;
    url: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
    isActive?: boolean;
    mimeType?: string;
    extension?: string;
    owner?: {
        uid: number;
    };
    sharedWith?: string[];
    version?: number;
    isPublic?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastAccessedAt?: Date;
    createdBy?: {
        uid: number;
    };
    updatedBy?: {
        uid: number;
    };
    fileUrl?: string;
    branch: {
        uid: number;
    };
}
