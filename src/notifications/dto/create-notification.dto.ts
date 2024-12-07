import { ApiProperty } from "@nestjs/swagger";
import { NotificationStatus, NotificationType } from "src/lib/enums/enums";
import { IsDate, IsEnum, IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsEnum(NotificationType)
    @ApiProperty({
        example: NotificationType.USER,
        description: 'The type of the notification'
    })
    type: NotificationType;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'New Order',
        description: 'The title of the notification'
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'A new order has been placed',
        description: 'The message of the notification'
    })
    message: string;

    @IsNotEmpty()
    @IsEnum(NotificationStatus)
    @ApiProperty({
        example: NotificationStatus.UNREAD,
        description: 'Whether the notification is read'
    })
    status: NotificationStatus;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The owner of the notification'
    })
    owner: { uid: number };
}
