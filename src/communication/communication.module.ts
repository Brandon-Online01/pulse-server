import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationLog } from './entities/communication-log.entity';

@Module({
  imports: [
    NotificationsModule,
    UserModule,
    TypeOrmModule.forFeature([CommunicationLog])
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule { }
