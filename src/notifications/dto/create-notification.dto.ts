import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsString } from "class-validator";
import { NotificationType } from "src/lib/enums/enums";

export class CreateNotificationDto {
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
    @IsEnum(NotificationType)
    @ApiProperty({
        example: NotificationType.ORDER,
        description: 'The type of the notification'
    })
    type: NotificationType;

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({
        example: false,
        description: 'Whether the notification is read'
    })
    isRead: boolean;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The owner of the notification'
    })
    owner: { uid: number };
}
