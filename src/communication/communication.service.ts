import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommunicationService {
  private readonly emailService: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
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
} 
