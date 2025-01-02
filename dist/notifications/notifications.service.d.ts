import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationResponse } from 'src/lib/types/notification';
import { RewardsService } from 'src/rewards/rewards.service';
export declare class NotificationsService {
    private readonly notificationRepository;
    private readonly rewardsService;
    constructor(notificationRepository: Repository<Notification>, rewardsService: RewardsService);
    create(createNotificationDto: CreateNotificationDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        message: string;
        notifications: Notification[] | null;
    }>;
    findOne(ref: number): Promise<{
        message: string;
        notification: Notification | null;
    }>;
    findForUser(ref: number): Promise<{
        message: string;
        notification: NotificationResponse[] | null;
    }>;
    update(ref: number, updateNotificationDto: UpdateNotificationDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
