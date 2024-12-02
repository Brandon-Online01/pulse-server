import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommunicationService {
  constructor() { }

  @OnEvent('send.email')
  sendEmail(user: User): string {
    try {
      const message = `Welcome to our platform, ${user.name}!`;

      return message;
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  @OnEvent('send.sms')
  sendSms(user: User): string {
    try {
      const message = `Welcome to our platform, ${user.name}!`;

      return message;
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }
} 
