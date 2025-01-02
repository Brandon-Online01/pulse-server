import { CreateNotificationDto } from './create-notification.dto';
import { NotificationStatus, NotificationType } from '../../lib/enums/notification.enums';
declare const UpdateNotificationDto_base: import("@nestjs/common").Type<Partial<CreateNotificationDto>>;
export declare class UpdateNotificationDto extends UpdateNotificationDto_base {
    type?: NotificationType;
    title?: string;
    message?: string;
    status?: NotificationStatus;
    owner?: {
        uid: number;
    };
}
export {};
