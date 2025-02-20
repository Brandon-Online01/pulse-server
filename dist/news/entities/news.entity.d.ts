import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { NewsCategory } from '../../lib/enums/news.enums';
import { GeneralStatus } from '../../lib/enums/status.enums';
import { User } from '../../user/entities/user.entity';
export declare class News {
    uid: number;
    title: string;
    subtitle: string;
    content: string;
    attachments: string;
    coverImage: string;
    thumbnail: string;
    publishingDate: Date;
    status: GeneralStatus;
    author: User;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    category: NewsCategory;
    shareLink: string;
    branch: Branch;
    organisation: Organisation;
}
