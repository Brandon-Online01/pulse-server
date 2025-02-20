import { User } from "../../user/entities/user.entity";
import { NotificationType, NotificationStatus } from "../../lib/enums/notification.enums";
import { Branch } from "src/branch/entities/branch.entity";
import { Organisation } from "src/organisation/entities/organisation.entity";
export declare class Notification {
    uid: number;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    organisation: Organisation;
    branch: Branch;
}
