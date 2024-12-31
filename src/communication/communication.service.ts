import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AccessLevel } from '../lib/enums/user.enums';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { EmailType } from '../lib/enums/email.enums';
import { EmailTemplate } from '../lib/interfaces/email.interface';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationLog } from './entities/communication-log.entity';
import { renderSignupTemplate, renderVerificationTemplate, renderPasswordResetTemplate, renderOrderTemplate, renderInvoiceTemplate, renderPasswordChangedTemplate, renderOrderOutForDeliveryTemplate, renderOrderDeliveredTemplate, renderDailyReportTemplate } from '../lib/templates/emails';
import { DailyReportData, InvoiceData, OrderData, OrderDeliveredData, OrderOutForDeliveryData, PasswordChangedData, PasswordResetData, VerificationEmailData } from 'src/lib/types/email-templates.types';
import { SignupEmailData } from 'src/lib/types/email-templates.types';

@Injectable()
export class CommunicationService {
	private readonly emailService: nodemailer.Transporter;

	constructor(
		private readonly configService: ConfigService,
		private readonly notificationsService: NotificationsService,
		private readonly userService: UserService,
		@InjectRepository(CommunicationLog)
		private communicationLogRepository: Repository<CommunicationLog>
	) {
		this.emailService = nodemailer.createTransport({
			host: this.configService.get<string>('SMTP_HOST'),
			port: this.configService.get<number>('SMTP_PORT'),
			secure: this.configService.get<number>('SMTP_PORT') === 465,
			auth: {
				user: this.configService.get<string>('SMTP_USER'),
				pass: this.configService.get<string>('SMTP_PASS'),
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	@OnEvent('send.email')
	async sendEmail(
		emailType: EmailType,
		recipientRoles: AccessLevel[],
		data: Record<string, any>
	) {
		try {
			const users = await this.userService.getUsersByRole(recipientRoles);

			const recipients = users?.users?.map((user: User) => user?.email);

			if (!recipients) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const template = this.getEmailTemplate(emailType, data);

			const result = await this.emailService.sendMail({
				from: this.configService.get<string>('SMTP_FROM'),
				to: recipients,
				subject: template.subject,
				html: template.body,
			});

			await this.communicationLogRepository.save({
				emailType,
				recipientRoles,
				accepted: result.accepted,
				rejected: result.rejected,
				messageId: result.messageId,
				messageSize: result.messageSize,
				envelopeTime: result.envelopeTime,
				messageTime: result.messageTime,
				response: result.response,
				envelope: result.envelope,
			});

			return result;
		} catch (error) {
			throw error;
		}
	}

	private getEmailTemplate(type: EmailType, data: Record<string, any>): EmailTemplate {
		switch (type) {
			case EmailType.SIGNUP:
				return {
					subject: 'Welcome to Our Platform',
					body: renderSignupTemplate(data as SignupEmailData),
				};
			case EmailType.VERIFICATION:
				return {
					subject: 'Verify Your Email',
					body: renderVerificationTemplate(data as VerificationEmailData),
				};
			case EmailType.PASSWORD_RESET:
				return {
					subject: 'Password Reset Request',
					body: renderPasswordResetTemplate(data as PasswordResetData),
				};
			case EmailType.ORDER_CONFIRMATION:
				return {
					subject: 'Order Confirmation',
					body: renderOrderTemplate(data as OrderData),
				};
			case EmailType.INVOICE:
				return {
					subject: 'Invoice for Your Order',
					body: renderInvoiceTemplate(data as InvoiceData),
				};
			case EmailType.PASSWORD_CHANGED:
				return {
					subject: 'Password Successfully Changed',
					body: renderPasswordChangedTemplate(data as PasswordChangedData),
				};
			case EmailType.ORDER_OUT_FOR_DELIVERY:
				return {
					subject: 'Your Order is Out for Delivery',
					body: renderOrderOutForDeliveryTemplate(data as OrderOutForDeliveryData),
				};
			case EmailType.ORDER_DELIVERED:
				return {
					subject: 'Your Order Has Been Delivered',
					body: renderOrderDeliveredTemplate(data as OrderDeliveredData),
				};
			case EmailType.DAILY_REPORT:
				return {
					subject: 'Daily Report',
					body: renderDailyReportTemplate(data as DailyReportData),
				};
			default:
				throw new NotFoundException(`Unknown email template type: ${type}`);
		}
	}

	@OnEvent('send.notification')
	async sendNotification(notification: CreateNotificationDto, recipients: AccessLevel[]) {
		try {
			const users = await this.userService.getUsersByRole(recipients);

			const notifications = users.users.map((user: User) => ({
				...notification,
				owner: user
			}));

			await Promise.all(
				notifications.map(notif => this.notificationsService.create(notif))
			);
		} catch (error) {
			throw error;
		}
	}

} 
