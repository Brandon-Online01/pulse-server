import { User } from "../../user/entities/user.entity";
import { NotificationType, NotificationStatus } from "../../lib/enums/notification.enums";
export declare class Notification {
    uid: number;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
}
