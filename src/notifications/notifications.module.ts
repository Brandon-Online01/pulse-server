import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { OrderNotificationsService } from './order-notifications.service';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Notification]),
    RewardsModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, OrderNotificationsService],
  exports: [NotificationsService, OrderNotificationsService]
})
export class NotificationsModule { }
