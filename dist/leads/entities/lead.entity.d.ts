import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Client } from '../../clients/entities/client.entity';
import { LeadStatus } from '../../lib/enums/lead.enums';
export declare class Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    notes: string;
    status: LeadStatus;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    ownerUid: number;
    branch: Branch;
    branchUid: number;
    client: Client;
}
