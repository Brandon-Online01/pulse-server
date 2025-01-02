import { NotificationType, NotificationStatus } from "../enums/notification.enums";
export interface NotificationResponse {
    uid: number;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
}
