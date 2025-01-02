import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { EmailType } from '../lib/enums/email.enums';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { CommunicationLog } from './entities/communication-log.entity';
import { EmailTemplateData } from '../lib/types/email-templates.types';
export declare class CommunicationService {
    private readonly configService;
    private readonly notificationsService;
    private readonly userService;
    private communicationLogRepository;
    private readonly emailService;
    constructor(configService: ConfigService, notificationsService: NotificationsService, userService: UserService, communicationLogRepository: Repository<CommunicationLog>);
    sendEmail<T extends EmailType>(emailType: T, recipientsEmails: string[], data: EmailTemplateData<T>): Promise<any>;
    private getEmailTemplate;
    sendNotification(notification: CreateNotificationDto, recipients: string[]): Promise<void>;
}
