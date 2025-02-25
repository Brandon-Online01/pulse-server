import { NotificationType } from '../../lib/enums/notification.enums';
export declare class CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    owner: {
        uid: number;
    };
}
