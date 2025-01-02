import { User } from '../../user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { Client } from 'src/clients/entities/client.entity';
import { LeadStatus } from 'src/lib/enums/leads.enums';
export declare class Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    status: LeadStatus;
    isDeleted: boolean;
    owner: User;
    branch: Branch;
    client: Client;
}
