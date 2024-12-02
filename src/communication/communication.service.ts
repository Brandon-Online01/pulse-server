import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommunicationService {
  constructor() { }

  @OnEvent('send.email')
  sendEmail(user: User): string {
    try {
      const message = `welcome to our platform, ${user.name}!`;

      return message;
    } catch (error) {
      console.error('failed to send email:', error);
    }
  }

  @OnEvent('send.sms')
  sendSms(user: User): string {
    try {
      const message = `welcome to our platform, ${user.name}!`;

      return message;
    } catch (error) {
      console.error('failed to send sms:', error);
    }
  }
} 
