import { NotificationType } from "../enums/enums";
import { NotificationStatus } from "../enums/enums";

export interface NotificationResponse {
    uid: number;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
}
