import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
export declare class Journal {
    uid: number;
    clientRef: string;
    fileURL: string;
    comments: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    owner: User;
    branch: Branch;
}
