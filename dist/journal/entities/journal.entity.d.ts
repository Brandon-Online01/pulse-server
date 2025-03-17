import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { JournalStatus } from 'src/lib/enums/journal.enums';
export declare class Journal {
    uid: number;
    clientRef: string;
    fileURL: string;
    comments: string;
    status: JournalStatus;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    owner: User;
    branch: Branch;
    organisation: Organisation;
}
