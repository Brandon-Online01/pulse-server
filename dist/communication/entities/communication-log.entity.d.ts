import { Branch } from 'src/branch/entities/branch.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
export declare class CommunicationLog {
    uid: string;
    emailType: string;
    recipientEmails: string[];
    accepted: string[];
    rejected: string[];
    messageId: string;
    messageSize: number;
    envelopeTime: number;
    messageTime: number;
    response: string;
    envelope: {
        from: string;
        to: string[];
    };
    createdAt: Date;
    branch: Branch;
    organisation: Organisation;
}
