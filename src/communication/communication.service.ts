import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AccessLevel } from '../lib/enums/user.enums';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';

@Injectable()
export class CommunicationService {
  private readonly emailService: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService
  ) {
    this.emailService = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  @OnEvent('send.email')
  sendEmail() {
    console.log('email sent');
  }

  @OnEvent('send.sms')
  sendSms() {
    console.log('sms sent');
  }

  @OnEvent('send.push')
  sendPush() {
    console.log('push sent');
  }

  @OnEvent('send.notification')
  async sendNotification(notification: CreateNotificationDto, recipients: AccessLevel[]) {
    try {
      //send to people with the role of the recipient
      const createdNotification = await this.notificationsService.create(notification);
    } catch (error) {
      throw error;
    }
  }
} 
