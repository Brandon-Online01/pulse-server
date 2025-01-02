import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        notifications: import("./entities/notification.entity").Notification[] | null;
    }>;
    findOne(ref: number): Promise<{
        message: string;
        notification: import("./entities/notification.entity").Notification | null;
    }>;
    findForUser(ref: number): Promise<{
        message: string;
        notification: import("../lib/types/notification").NotificationResponse[] | null;
    }>;
    update(ref: number, updateNotificationDto: UpdateNotificationDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
