import { Branch } from '../../branch/entities/branch.entity';
import { User } from '../../user/entities/user.entity';
export declare class Doc {
    uid: number;
    title: string;
    content: string;
    description?: string;
    fileType: string;
    fileSize: number;
    url: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
    isActive: boolean;
    mimeType?: string;
    extension?: string;
    sharedWith?: string[];
    version?: number;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    owner: User;
    branch: Branch;
}
