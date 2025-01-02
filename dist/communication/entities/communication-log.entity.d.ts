import { EmailType } from '../../lib/enums/email.enums';
export declare class CommunicationLog {
    uid: string;
    emailType: EmailType;
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
}
