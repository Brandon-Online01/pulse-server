import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationStatus, NotificationType } from '../../lib/enums/notification.enums';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;

    @IsOptional()
    @IsObject()
    owner?: { uid: number };
}
