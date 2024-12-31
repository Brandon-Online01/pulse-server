import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { RewardsModule } from 'src/rewards/rewards.module';
import { OrderNotificationsService } from './order-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), RewardsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, OrderNotificationsService],
  exports: [NotificationsService, OrderNotificationsService]
})
export class NotificationsModule { }
